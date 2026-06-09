import { Suspense } from "react";
import { useAtomValue, Provider as JotaiProvider } from "jotai";
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
import { SquareArrowOutUpRight } from "lucide-react";

const hasChoices = (name, dataProps, analysis) => {
  const values = dataProps[name];
  if (values === undefined) return true;
  if (!Array.isArray(values)) return false;
  if (analysis.dimension === name && analysis.operation.startsWith("subtract-"))
    return false;
  return true;
};

function MiniPortalToolbar({ title, ...dataProps }) {
  const analysis = useAtomValue(analysisAtom);
  const dataPermalink = useAtomValue(dataPermalinkAtom);
  const catalogQueries = useAtomValue(catalogQueriesAtom);

  const dimensionSelects = catalogQueries.activeDimensions
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
      return (
        <DimensionSelect
          choices={choices}
          key={dimension.name}
          className="w-auto min-w-35 mb-0"
          name={dimension.name}
          showSelectionMode={false}
        />
      );
    });

  return (
    <div className="p-3 flex gap-2 items-center">
      {title && <h2 className="text-lg m-0 p-0 shrink-0 me-3">{title}</h2>}
      {dimensionSelects}
      <TimeSelect showSelectionMode={false} />
      <Button
        asChild
        title={`Open ${title} in the Master Plan Data Portal`}
        variant="outline"
      >
        <a href={dataPermalink} target="_blank">
          <SquareArrowOutUpRight />
        </a>
      </Button>
    </div>
  );
}

function MiniPortalContent({ title, ...dataProps }) {
  const selectedGeographies = useAtomValue(selectedGeographiesAtom);

  return (
    <div className="border bg-popover mb-6">
      <Suspense>
        <MiniPortalToolbar title={title} {...dataProps} />
        <Map className="h-125 max-h-[40vh]" />
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

export default function MiniPortalImpl({ title, ...dataProps }) {
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
          <MiniPortalContent title={title} {...dataProps} />
        </ThemeProvider>
      </ScopeDataProvider>
    </JotaiProvider>
  );
}
