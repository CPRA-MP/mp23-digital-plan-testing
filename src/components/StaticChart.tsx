import BrowserOnly from "@docusaurus/BrowserOnly";

/**
 * Renders a static Vega-Lite spec via vega-embed, themed to match the site's
 * light/dark mode. See StaticChartImpl for the actual implementation - it's kept
 * in a separate module and required lazily so its browser-only import
 * (vega-embed) never loads during SSR.
 */
export default function StaticChart(props) {
  return (
    <BrowserOnly>
      {() => {
        const { default: StaticChartImpl } = require("./StaticChartImpl");
        return <StaticChartImpl {...props} />;
      }}
    </BrowserOnly>
  );
}
