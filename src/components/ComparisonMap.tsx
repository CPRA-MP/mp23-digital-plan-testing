import { useEffect, useRef } from "react";
import { Map as GLMap } from "maplibre-gl";
import GLCompare from "@maplibre/maplibre-gl-compare";

import "maplibre-gl/dist/maplibre-gl.css";
import "@maplibre/maplibre-gl-compare/dist/maplibre-gl-compare.css";

export default function ComparisonMap({
  beforeUrl,
  afterUrl,
  center = [-91.5, 29.75],
  zoom = 7,
}) {
  const container = useRef(null);
  useEffect(() => {
    if (!container.current) return;

    const beforeMap = new GLMap({
      container: "before",
      style: beforeUrl,
      center,
      zoom,
    });

    const afterMap = new GLMap({
      container: "after",
      style: afterUrl,
      center,
      zoom,
    });

    const map = new GLCompare(beforeMap, afterMap, container.current, {});
  }, [container.current]);

  const mapStyle = {
    bottom: 0,
    position: "absolute",
    top: 0,
    width: "100%",
  };

  return (
    <div
      ref={container}
      style={{ height: "500px", position: "relative", width: "100%" }}
    >
      <div id="before" className="map" style={mapStyle}></div>
      <div id="after" className="map" style={mapStyle}></div>
    </div>
  );
}
