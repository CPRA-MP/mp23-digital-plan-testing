import {
  Map as CpraMap,
  HashDataProvider,
  ThemeProvider,
  store,
} from "@cpra/mp-ui";
import { Provider as JotaiProvider } from "jotai";
import { Suspense } from "react";

export default function Map() {
  return (
    <JotaiProvider store={store}>
      <HashDataProvider>
        <ThemeProvider>
          <Suspense>
            <CpraMap className="h-[400px]" />
          </Suspense>
        </ThemeProvider>
      </HashDataProvider>
    </JotaiProvider>
  );
}
