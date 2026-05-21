import {
  Map as CpraMap,
  HashDataProvider,
  ThemeProvider,
  store,
} from "@cpra/mp-ui";
import { Provider as JotaiProvider } from "jotai";
import { Suspense } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

export default function Map() {
  return (
    <JotaiProvider store={store}>
      <HashDataProvider>
        <ThemeProvider>
          <Suspense>
            <CpraMap className="h-125" />
          </Suspense>
        </ThemeProvider>
      </HashDataProvider>
    </JotaiProvider>
  );
}
