import { Suspense, useEffect, useRef, useState } from "react";
import { useAtomValue, Provider as JotaiProvider, atom, useAtom } from "jotai";
import {
  Chart,
  DimensionSelect,
  Map,
  ScopeDataProvider,
  ThemeProvider,
  TimeSelect,
  analysisAtom,
  catalogQueriesAtom,
  dataPermalinkAtom,
  selectedGeographiesAtom,
  store,
} from "@cpra/mp-ui";

import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Layers, Menu, SquareArrowOutUpRight, X } from "lucide-react";

const defaultProjectModelGroups = [
  [0, "Existing Conditions"],
  [700, "Initial Conditions"],
  [701, "All Candidate Projects"],
  [702, "Projects in Engineering and Design"],
];

const hasChoices = (name, dataProps, analysis) => {
  const values = dataProps[name];
  if (values === undefined) return true;
  if (!Array.isArray(values)) return false;
  if (analysis.dimension === name && analysis.operation.startsWith("subtract-"))
    return false;
  return true;
};

const showInstructionsAtom = atom(true);

function MiniPortalInstructions() {
  const [show, setShow] = useAtom(showInstructionsAtom);
  const selectedGeographies = useAtomValue(selectedGeographiesAtom);
  const mapCatalogQuery = useAtomValue(catalogQueriesAtom).getMapCatalogQuery();
  const gridLabel = mapCatalogQuery.dataset.grid.label.toLowerCase();

  useEffect(() => {
    if (selectedGeographies.length) setShow(false);
  }, [selectedGeographies]);

  return show ? (
    <div className="absolute top-3 left-[25%] right-[25%] py-2 px-4 text-sm bg-sidebar/90 rounded flex gap-3 items-center">
      <span>
        Click the map to select a {gridLabel} and view a time series chart.
      </span>
      <Button
        variant="ghost"
        aria-description="Close"
        onClick={() => setShow(false)}
      >
        <X />
      </Button>
    </div>
  ) : null;
}

function MapOptionsPopover({
  projectModelGroups,
  checked,
  onToggle,
  showLabel = false,
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" title="Map options">
          <Layers />
          {showLabel && "Layers"}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <span className="font-medium">Projects</span>
        {projectModelGroups.map(([value, label]) => (
          <label key={value} className="flex items-center gap-2">
            <Checkbox
              checked={checked.has(value)}
              onCheckedChange={() => onToggle(value)}
            />
            {label}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function MiniPortalToolbar({
  title,
  projectModelGroups,
  checkedModelGroups,
  onToggleModelGroup,
  ...dataProps
}) {
  const [open, setOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const timeSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = timeSelectRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setNarrow(entry.contentRect.width < 300);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!narrow) setOpen(false);
  }, [narrow]);

  const analysis = useAtomValue(analysisAtom);
  const dataPermalink = useAtomValue(dataPermalinkAtom);
  const catalogQueries = useAtomValue(catalogQueriesAtom);

  const activeDimensionConfigs = catalogQueries.activeDimensions
    .filter(
      (dim) =>
        dim.filterType === "select" &&
        hasChoices(dim.name, dataProps, analysis),
    )
    .map((dimension) => {
      let choices = undefined;
      const values = dataProps[dimension.name];
      if (Array.isArray(values))
        choices = values
          .map((item) => (Array.isArray(item) ? item : [item, item.toString()]))
          .map(([value, label]) => ({ value, label }));
      return { name: dimension.name, choices };
    });

  const dimensionSelects = activeDimensionConfigs.map(({ name, choices }) => (
    <DimensionSelect
      choices={choices}
      key={name}
      className="w-auto min-w-35 mb-0"
      name={name}
      showSelectionMode={false}
    />
  ));

  const dimensionSelectsMobile = activeDimensionConfigs.map(
    ({ name, choices }) => (
      <DimensionSelect
        choices={choices}
        key={name}
        className="w-full mb-0"
        name={name}
        showSelectionMode={false}
      />
    ),
  );

  const mapOptions = (
    <MapOptionsPopover
      projectModelGroups={projectModelGroups}
      checked={checkedModelGroups}
      onToggle={onToggleModelGroup}
    />
  );
  const mapOptionsMobile = (
    <MapOptionsPopover
      projectModelGroups={projectModelGroups}
      checked={checkedModelGroups}
      onToggle={onToggleModelGroup}
      showLabel
    />
  );

  const portalLink = (
    <Button
      asChild
      title={`Open ${title} in the Master Plan Data Portal`}
      variant="outline"
    >
      <a href={dataPermalink} target="_blank">
        <SquareArrowOutUpRight />
      </a>
    </Button>
  );

  return (
    <>
      {/* Always rendered so the TimeSelect can be measured via ResizeObserver;
          invisible + non-interactive when narrow so the overlay covers it */}
      <div
        className={`p-3 flex gap-2 items-center${narrow ? " invisible pointer-events-none" : ""}`}
      >
        {title && <h2 className="text-lg m-0 p-0 shrink-0 me-3">{title}</h2>}
        {dimensionSelects}
        <div ref={timeSelectRef} className="flex-1 min-w-0 flex items-center">
          <TimeSelect showSelectionMode={false} />
        </div>
        {mapOptions}
        {portalLink}
      </div>
      {/* Narrow bar — overlays the wide toolbar when narrow */}
      {narrow && (
        <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between bg-popover z-10">
          {title && <h2 className="text-lg m-0 p-0 shrink-0">{title}</h2>}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu />
            <span className="sr-only">Open controls</span>
          </Button>
        </div>
      )}
      {/* Controls panel — absolutely positioned within the mini portal container */}
      {narrow && open && (
        <div className="absolute top-0 right-0 bottom-0 w-3/4 max-w-xs bg-popover border-l z-50 flex flex-col gap-5 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            {title && <span className="text-base font-medium">{title}</span>}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
            >
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          {dimensionSelectsMobile}
          <TimeSelect showSelectionMode={false} />
          {mapOptionsMobile}
          <Button
            asChild
            className="no-underline"
            title={`Open ${title} in the Master Plan Data Portal`}
            variant="outline"
          >
            <a href={dataPermalink} target="_blank">
              <SquareArrowOutUpRight />
              View in Data Portal
            </a>
          </Button>
        </div>
      )}
    </>
  );
}

function MiniPortalContent({ title, projectModelGroups, ...dataProps }) {
  const selectedGeographies = useAtomValue(selectedGeographiesAtom);
  const [checkedModelGroups, setCheckedModelGroups] = useState(
    () => new Set(projectModelGroups.map(([value]) => value)),
  );

  const toggleModelGroup = (value) =>
    setCheckedModelGroups((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  const styleParams = Array.from(checkedModelGroups).map((value) => [
    "projects_model_group_id",
    value,
  ]);

  return (
    <div className="relative border bg-popover mb-6">
      <Suspense>
        <MiniPortalToolbar
          title={title}
          projectModelGroups={projectModelGroups}
          checkedModelGroups={checkedModelGroups}
          onToggleModelGroup={toggleModelGroup}
          {...dataProps}
        />
        <div className="h-125 max-h-[40vh] relative">
          <Map className="h-125 max-h-[40vh]" styleParams={styleParams} />
          <MiniPortalInstructions />
        </div>
      </Suspense>
      <Suspense>
        {selectedGeographies.length > 0 && (
          <div className="h-125 max-h-[40vh] p-3">
            <Chart />
          </div>
        )}
      </Suspense>
    </div>
  );
}

export default function MiniPortalImpl({
  title,
  projectModelGroups = defaultProjectModelGroups,
  ...dataProps
}) {
  const analysis = useAtomValue(analysisAtom);
  const filteredDataProps = Object.fromEntries(
    Object.entries(dataProps).filter(
      ([name]) => !hasChoices(name, dataProps, analysis),
    ),
  );

  return (
    <JotaiProvider store={store}>
      <ScopeDataProvider {...filteredDataProps}>
        <ThemeProvider>
          <MiniPortalContent
            title={title}
            projectModelGroups={projectModelGroups}
            {...dataProps}
          />
        </ThemeProvider>
      </ScopeDataProvider>
    </JotaiProvider>
  );
}
