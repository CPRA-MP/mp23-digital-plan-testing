import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";

/** How many video frames of resting time fit into one page-height's worth of extra
 * scroll. Only matters when startFrame/endFrame are given — raise it to make a given
 * frame range cover less scroll distance (faster pacing), lower it for more. */
const FRAMES_PER_PAGE_HEIGHT = 100;

export default function StoryPage({
  children,
  first = false,
  startFrame,
  endFrame,
  className = "",
}: {
  children: ReactNode;
  /** Marks the page that's already visible on load, sitting over the video's first
   * frame instead of below it. Pulls the page up over the video (negative margin)
   * and shortens how long its sticky box stays pinned, so it starts scrolling away
   * as soon as the user starts scrolling instead of holding for a full page-height
   * like the others. The shorter pin works by nesting the sticky box in a wrapper
   * sized so position:sticky's centering (top-50%/translate-y-[-50%], which resolves
   * against the viewport since no ancestor is a scroll container) lands exactly on
   * the wrapper's bottom-edge clamp — so there's no dead zone where it sits
   * centered before scroll starts moving it. */
  first?: boolean;
  /** The video frame at which this page's content reaches its resting position,
   * vertically centered on the screen. Together with endFrame this sets how much
   * scroll distance the page holds still for before it starts leaving. Omit both to
   * keep the previous fixed page length. */
  startFrame?: number;
  /** The video frame at which this page's content starts scrolling upward off the
   * screen, ending the hold that began at startFrame. */
  endFrame?: number;
  /** Extra classes appended after the inner wrapper's default styles, so they
   * can add to or override them. */
  className?: string;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [boxRef, bounds] = useMeasure();
  const [wrapperHeight, setWrapperHeight] = useState<number>();

  useLayoutEffect(() => {
    if (!first || !bounds.height) return;
    function recompute() {
      const docTop =
        pageRef.current!.getBoundingClientRect().top + window.scrollY;
      setWrapperHeight(window.innerHeight / 2 - docTop + bounds.height);
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [first, bounds.height]);

  const hold =
    startFrame != null && endFrame != null
      ? (endFrame - startFrame) / FRAMES_PER_PAGE_HEIGHT
      : 0.5;

  const stickyBox = (
    <div
      ref={first ? boxRef : undefined}
      className="sticky top-[50%] translate-y-[-50%]"
    >
      <div
        className={`bg-white text-black w-[60dvw] sm:w-[40dvw] max-w-150 ml-[5dvw] p-3 md:p-4 lg:p-6 cursor-auto text-sm md:text-base lg:text-lg [&_h2]:uppercase [&_h2]:text-lg md:[&_h2]:text-xl lg:[&_h2]:text-2xl [&_p]:leading-5 [&_*:last-child]:mb-0 ${className}`}
      >
        {children}
      </div>
    </div>
  );
  return (
    <div
      ref={first ? pageRef : undefined}
      style={{ height: `calc((1.5 + ${hold}) * var(--page-height))` }}
      className={`relative z-100 pb-[calc(0.5*var(--page-height))] ${
        first ? "mt-[calc(var(--page-height)*-1)]" : ""
      }`}
    >
      {first ? (
        <div style={{ height: wrapperHeight }}>{stickyBox}</div>
      ) : (
        stickyBox
      )}
    </div>
  );
}
