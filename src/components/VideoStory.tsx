import { ReactNode, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import useMeasure from "react-use-measure";
import { mergeRefs } from "react-merge-refs";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

export default function VideoStory({
  src,
  children,
}: {
  src: string;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measureRef, bounds] = useMeasure();
  const videoRef = useRef<HTMLVideoElement>(null);

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

    once(video, "loadedmetadata", () => {
      tl.fromTo(
        video,
        {
          currentTime: 0,
        },
        {
          currentTime: video.duration || 1,
        },
      );
    });
  }, []);

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
      });
    }
  }, []);

  return (
    <div className="w-dvw cursor-grab select-none" ref={containerRef}>
      <div className="bg-white w-dvw overflow-hidden sticky top-[--header-height] z-1">
        <video
          src={src}
          playsInline={true}
          webkit-playsinline="true"
          preload="auto"
          muted={true}
          className={`h-[--page-height]`}
          style={{
            marginLeft: `calc((${Math.round(bounds.width)}px - 100dvw) * -1 / 2)`,
          }}
          ref={mergeRefs<HTMLVideoElement>([videoRef, measureRef])}
        ></video>
      </div>
      {children}
    </div>
  );
}
