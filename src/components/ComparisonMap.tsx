import { useEffect, useRef } from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";

import "maplibre-gl/dist/maplibre-gl.css";
import "@maplibre/maplibre-gl-compare/dist/maplibre-gl-compare.css";

import { ControlPosition, IControl, Map } from "maplibre-gl";

export class CPRAMapLegendControl implements IControl {
  _container: HTMLElement | undefined;
  _map: Map | undefined;

  getDefaultPosition(): ControlPosition {
    return "bottom-left";
  }

  onAdd(map: Map) {
    this._map = map;
    this.addEventHandlers();
    this._container = document.createElement("div");
    this._container.className =
      "maplibregl-ctrl maplibregl-ctrl-group cpra-map-legend";
    return this._container;
  }

  onRemove() {
    if (this._container?.parentNode)
      this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }

  addEventHandlers() {
    if (this._map) {
      const update = () => this.updateLegend();
      this._map.on("load", update);
      this._map.on("styledata", update);
    }
  }

  updateLegend() {
    if (this._map && this._container) {
      const legend = this._map.getGlobalState()?.legend;
      this.clearContainer();
      if (legend)
        for (const spec of legend.entries) {
          const entry = document.createElement("div");
          entry.className = "entry";

          if (spec.title) {
            const title = document.createElement("h2");
            title.className = "title";
            title.innerText = spec.title;

            if (spec.subtitle) {
              const subtitle = document.createElement("span");
              subtitle.className = "subtitle";
              subtitle.innerText = `(${spec.subtitle})`;
              title.innerText += " ";
              title.append(subtitle);
            }

            entry.append(title);
          }

          if (spec.type === "discrete")
            this.addDiscreteSteps(entry, spec.steps);
          else if (spec.type === "continuous")
            this.addContinuousSteps(entry, spec.steps);

          this._container.append(entry);
        }
    }
  }

  addContinuousSteps(entry, steps) {
    if (steps.length < 2) return;

    const start = steps[0].value;
    const end = steps[steps.length - 1].value;
    const range = end - start;
    const stops = steps.map((step) => ({
      ...step,
      pct: ((step.value - start) * 100) / range,
    }));

    const container = document.createElement("div");
    container.className = "continuous-steps";

    const symbol = document.createElement("div");
    symbol.className = "continuous-symbol";
    const gradient = stops
      .map((stop) => `${stop.color} ${stop.pct}%`)
      .join(", ");
    symbol.style.backgroundImage = `linear-gradient(to right, ${gradient})`;
    container.append(symbol);

    const ticks = document.createElement("div");
    ticks.className = "continuous-ticks";
    for (const stop of stops) {
      const tick = document.createElement("div");
      tick.className = "tick";
      tick.style.left = `${stop.pct}%`;
      const label = document.createElement("span");
      label.className = "label";
      label.style.left = `-${stop.pct}%`;
      label.innerText = stop.value.toString();
      tick.append(label);
      ticks.append(tick);
    }

    container.append(ticks);

    entry.append(container);
  }

  addDiscreteSteps(entry, steps) {
    const seenLabels = new Set();
    for (const step of steps) {
      // Keep track of the labels we have seen, and don't add them to the legend again.
      if (seenLabels.has(step.label)) continue;
      seenLabels.add(step.label);

      const container = document.createElement("div");
      container.className = "discrete-step";
      const symbol = document.createElement("div");
      symbol.className = "discrete-symbol";
      symbol.style.backgroundColor = step.color;
      const label = document.createElement("span");
      label.className = "discrete-label";
      label.innerText = step.label;
      container.append(symbol, label);
      entry.append(container);
    }
  }

  clearContainer() {
    if (this._container) this._container.innerHTML = "";
  }
}

export default function ComparisonMap({
  beforeUrl,
  afterUrl,
  center = [-91.5, 29.75],
  zoom = 7,
}) {
  return (
    <BrowserOnly>
      {() => {
        const GLMap = require("maplibre-gl").Map;
        const GLCompare = require("@maplibre/maplibre-gl-compare");
        const container = useRef(null);
        useEffect(() => {
          if (!container.current) return;

          const beforeMap = new GLMap({
            container: "before",
            style: beforeUrl,
            center,
            zoom,
          });

          beforeMap.addControl(new CPRAMapLegendControl());

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
      }}
    </BrowserOnly>
  );
}
