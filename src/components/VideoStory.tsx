import {
  ReactNode,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  createContext,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import useMeasure from "react-use-measure";
import { mergeRefs } from "react-merge-refs";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

export type StoryLabelEntry = {
  el: HTMLElement;
  startFrame: number;
  endFrame: number;
  /** Whether this label should shift horizontally in lockstep with the video as the
   * user drags/pans it, instead of staying fixed on screen. */
  pan: boolean;
  /** When panning, pin to the screen edge and show a triangle instead of letting the
   * label slide off screen once its anchor point leaves the viewport. */
  edgeArrow: boolean;
  /** Last translateX (px) applied by positionLabel, so the untransformed home
   * position can be recovered from getBoundingClientRect on the next tick. */
  tx?: number;
};

/** Lets a StoryLabel anywhere in the tree register itself so VideoStory can toggle
 * its visibility off of the video's current frame as it scrubs, without putting the
 * frame in React state (which would re-render on every scroll tick). */
export const StoryLabelContext = createContext<
  ((entry: StoryLabelEntry) => () => void) | null
>(null);

export default function VideoStory({
  src,
  fps = 10,
  children,
}: {
  src: string;
  /** Frame rate of the source video, used to convert StoryLabel's startFrame/
   * endFrame props into playback time. */
  fps?: number;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measureRef, bounds] = useMeasure();
  const videoRef = useRef<HTMLVideoElement>(null);
  const labelsRef = useRef(new Set<StoryLabelEntry>());
  const panOffsetRef = useRef(0);

  // Horizontally place one label for the current pan offset. Plain pan labels just
  // track the video; edgeArrow labels clamp to the viewport edge and flip on a
  // triangle (via data-arrow) once their anchor point pans out of view.
  const positionLabel = useCallback((label: StoryLabelEntry) => {
    if (!label.pan) return;
    const change = panOffsetRef.current;
    if (!label.edgeArrow) {
      label.el.style.transform = `translateX(${change}px)`;
      return;
    }
    // getBoundingClientRect reflects the transform we last applied; subtracting that
    // recovers the untransformed home position without a separate cache (and stays
    // correct across resizes, since the rect is re-read each time).
    const rect = label.el.getBoundingClientRect();
    if (rect.width === 0) return; // hidden (display:none) — geometry not meaningful yet
    const homeLeft = rect.left - (label.tx ?? 0);
    const width = rect.width;
    const vw = document.documentElement.clientWidth;
    const pad = 16; // leaves room for the ~12px triangle to stay on screen
    const anchorX = homeLeft + width / 2 + change;

    let tx: number;
    let arrow = "";
    if (anchorX < 0) {
      tx = pad - homeLeft;
      arrow = "left";
    } else if (anchorX > vw) {
      tx = vw - pad - width - homeLeft;
      arrow = "right";
    } else {
      tx = change;
    }
    label.tx = tx;
    label.el.style.transform = `translateX(${tx}px)`;
    label.el.dataset.arrow = arrow;
  }, []);

  const updateLabels = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const frame = video.currentTime * fps;
    for (const label of labelsRef.current) {
      const visible = frame >= label.startFrame && frame < label.endFrame;
      label.el.style.display = visible ? "" : "none";
      // Reposition on reveal so a label uncovered mid-pan lands at the right spot.
      if (visible) positionLabel(label);
    }
  }, [fps, positionLabel]);

  const registerLabel = useCallback(
    (entry: StoryLabelEntry) => {
      labelsRef.current.add(entry);
      updateLabels();
      positionLabel(entry);
      return () => {
        labelsRef.current.delete(entry);
      };
    },
    [updateLabels, positionLabel],
  );

  useGSAP(() => {
    const video = videoRef.current;

    function once(el, event, fn) {
      var onceFn = function (e) {
        el.removeEventListener(event, onceFn);
        fn.apply(this, arguments);
      };
      el.addEventListener(event, onceFn);
      return onceFn;
    }

    once(document.documentElement, "touchstart", function (e) {
      video.play();
      video.pause();
    });

    let tl = gsap.timeline({
      defaults: { duration: 1 },
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        // A number (rather than `true`) eases currentTime toward the scroll
        // target over this many seconds instead of snapping to it every tick,
        // coalescing seeks and smoothing out raw scroll jitter.
        scrub: 0.5,
      },
    });

    function setupScrub() {
      tl.fromTo(
        video,
        {
          currentTime: 0,
        },
        {
          currentTime: video.duration || 1,
          ease: "none",
          onUpdate: updateLabels,
        },
      );
    }

    // If the video is served from cache, metadata can already be available by the
    // time this effect runs, in which case "loadedmetadata" has already fired and
    // will never fire again — leaving the scrub tween never created and the video
    // stuck on its first frame.
    if (video.readyState >= video.HAVE_METADATA) {
      setupScrub();
    } else {
      once(video, "loadedmetadata", setupScrub);
    }
  }, [updateLabels]);

  useLayoutEffect(() => {
    if (videoRef.current && containerRef.current) {
      const video = videoRef.current;
      const slider = containerRef.current;

      let isDown = false;
      let startX;

      // Start dragging: record initial mouse position and scroll state
      slider.addEventListener("pointerdown", (e) => {
        isDown = true;
        startX = e.pageX - video.offsetLeft;
      });

      // End dragging: clear state
      slider.addEventListener("pointercancel", () => {
        isDown = false;
        slider.style.cursor = "grab";
      });
      slider.addEventListener("pointerup", () => {
        isDown = false;
        slider.style.cursor = "grab";
      });

      // Perform scrolling: update scroll position based on mouse movement
      slider.addEventListener("pointermove", (e) => {
        const change = e.pageX - startX;
        if (!isDown || Math.abs(change) < 5) return;
        slider.style.cursor = "grabbing";
        video.style.marginLeft = `${change}px`;
        panOffsetRef.current = change;
        for (const label of labelsRef.current) positionLabel(label);
      });
    }
  }, [positionLabel]);

  // A resize changes which anchors are off screen, so re-clamp every label.
  useEffect(() => {
    const onResize = () => {
      for (const label of labelsRef.current) positionLabel(label);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [positionLabel]);

  return (
    <div className="w-dvw cursor-grab select-none" ref={containerRef}>
      <div className="bg-[#006B67] w-dvw overflow-hidden sticky top-(--header-height) z-1">
        <video
          src={src}
          playsInline={true}
          webkit-playsinline="true"
          preload="auto"
          muted={true}
          className={`h-(--page-height)`}
          style={{
            marginLeft: `calc((${Math.round(bounds.width)}px - 100dvw) * -1 / 2)`,
          }}
          ref={mergeRefs<HTMLVideoElement>([videoRef, measureRef])}
        ></video>
      </div>
      <StoryLabelContext.Provider value={registerLabel}>
        {children}
      </StoryLabelContext.Provider>
    </div>
  );
}
