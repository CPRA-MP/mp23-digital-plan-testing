import { useEffect, useRef } from "react";
import embed from "vega-embed";
import { useColorMode } from "@docusaurus/theme-common";

/**
 * BaseChart from @cpra/mp-ui only sizes its vega-embed instance correctly when
 * spec is a data-portal URL string (it re-fetches with width/height query params
 * on resize) - for a plain object spec it embeds once at whatever size the
 * container measured on the render before layout settled, so a "container"-sized
 * spec renders at 0x0 and never recovers. Calling vega-embed directly here avoids
 * that: the container already has real layout dimensions by the time this effect
 * runs, so Vega-Lite's own "container" autosize + resize observer works as
 * documented.
 *
 * Mark colors come from --chart-1 (the shadcn/mp-ui chart color token, themed for
 * light/dark in custom.css) rather than mp-ui's own chart config, which is an
 * unthemed Vega-Lite default (not part of mp-ui's public API) rather than this
 * site's actual palette. Don't set area/line/point color in a spec passed here -
 * StaticChart owns that so charts stay visually consistent site-wide.
 */
export default function StaticChartImpl({ spec, height = 260, className }) {
  const { colorMode } = useColorMode();
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    const accentColor = getComputedStyle(el).getPropertyValue("--chart-1").trim();

    const sizedSpec = {
      ...spec,
      width: "container",
      height: "container",
      config: {
        ...spec.config,
        view: { stroke: null },
        area: { fill: accentColor },
        line: { stroke: accentColor },
        point: { fill: accentColor, filled: true },
      },
    };

    let view;
    let cancelled = false;
    embed(el, sizedSpec, { actions: false }).then((result) => {
      if (cancelled) result.view.finalize();
      else view = result.view;
    });

    return () => {
      cancelled = true;
      view?.finalize();
    };
  }, [spec, colorMode]);

  return (
    <div ref={elRef} className={className} style={{ width: "100%", height }} />
  );
}
