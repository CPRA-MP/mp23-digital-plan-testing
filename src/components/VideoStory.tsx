import {
  ReactNode,
  useRef,
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

  const updateLabels = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const frame = video.currentTime * fps;
    for (const label of labelsRef.current) {
      label.el.style.display =
        frame >= label.startFrame && frame < label.endFrame ? "" : "none";
    }
  }, [fps]);

  const registerLabel = useCallback(
    (entry: StoryLabelEntry) => {
      labelsRef.current.add(entry);
      updateLabels();
      entry.el.style.transform = entry.pan
        ? `translateX(${panOffsetRef.current}px)`
        : "";
      return () => {
        labelsRef.current.delete(entry);
      };
    },
    [updateLabels],
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
        scrub: true,
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
        for (const label of labelsRef.current) {
          if (label.pan) label.el.style.transform = `translateX(${change}px)`;
        }
      });
    }
  }, []);

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
