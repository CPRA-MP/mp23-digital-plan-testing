import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";

/** Fallback for `--frames-per-page-height` when the story doesn't set one. See
 * VideoStory's `framesPerPageHeight` prop for how to pick a value. */
const DEFAULT_FRAMES_PER_PAGE_HEIGHT = 10;

/** Length of a StoryPage that has no startFrame/endFrame, in page-heights. Unlike a
 * framed page this isn't tied to the video: it's scroll distance the frame mapping
 * doesn't account for, which shifts every card after it later AND (because the video
 * scrubs across the container's whole height) pulls every card in the story slightly
 * earlier. Prefer giving a page real frames over relying on this. */
const UNFRAMED_PAGE_HEIGHTS = 2;

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
   * vertically centered on the screen — normally the frame of the storyboard card
   * this page renders. Omit both frames to fall back to a fixed page length. */
  startFrame?: number;
  /** The video frame at which the next page's content takes over, i.e. the next
   * page's startFrame. The page's height is exactly this span of frames converted to
   * scroll distance, with no fixed component — that proportionality is what keeps a
   * card arriving on the video frame it belongs to, so don't add a minimum height
   * here; lower `--frames-per-page-height` instead if a page is too short. */
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

  // Purely proportional to the frame span — a fixed base term would compress the
  // storyboard's dynamic range (gaps here run ~10x, a 1.5 base flattened that to
  // ~1.6x) and leave cards landing tens of frames away from their video moment.
  const span =
    startFrame != null && endFrame != null ? endFrame - startFrame : null;
  const height =
    span != null
      ? `calc(${span} / var(--frames-per-page-height, ${DEFAULT_FRAMES_PER_PAGE_HEIGHT}) * var(--page-height))`
      : `calc(${UNFRAMED_PAGE_HEIGHTS} * var(--page-height))`;

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
      data-story-page
      style={{ height }}
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
