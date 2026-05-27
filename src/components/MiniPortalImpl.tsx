import { Suspense } from "react";
import { useAtomValue, Provider as JotaiProvider } from "jotai";
import {
  Chart,
  Map,
  ScopeDataProvider,
  ThemeProvider,
  TimeSelect,
  dataPermalinkAtom,
  selectedGeographiesAtom,
  store,
} from "@cpra/mp-ui";

import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";

function MiniPortalToolbar({ title }) {
  const dataPermalink = useAtomValue(dataPermalinkAtom);

  return (
    <div className="p-3 flex gap-2 items-center">
      {title && <h2 className="text-lg m-0 p-0 shrink-0 me-3">{title}</h2>}
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

function MiniPortalContent({ title }) {
  const selectedGeographies = useAtomValue(selectedGeographiesAtom);

  return (
    <div className="border bg-popover mb-6">
      <Suspense>
        <MiniPortalToolbar title={title} />
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
  return (
    <JotaiProvider store={store}>
      <ScopeDataProvider {...dataProps}>
        <ThemeProvider>
          <MiniPortalContent title={title} />
        </ThemeProvider>
      </ScopeDataProvider>
    </JotaiProvider>
  );
}
