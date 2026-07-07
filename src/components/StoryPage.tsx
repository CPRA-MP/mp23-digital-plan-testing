import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";

export default function StoryPage({
  children,
  first = false,
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
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [boxRef, bounds] = useMeasure();
  const [wrapperHeight, setWrapperHeight] = useState<number>();

  useLayoutEffect(() => {
    if (!first || !bounds.height) return;
    function recompute() {
      const docTop = pageRef.current!.getBoundingClientRect().top + window.scrollY;
      setWrapperHeight(window.innerHeight / 2 - docTop + bounds.height);
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [first, bounds.height]);

  const stickyBox = (
    <div
      ref={first ? boxRef : undefined}
      className="sticky top-[50%] translate-y-[-50%] bg-[#ffffffe0] text-black w-[40dvw] ml-[5dvw] p-3 cursor-auto [&>h2]:uppercase [&>h2]:text-lg [&>p]:leading-5 [&>*:last-child]:mb-0"
    >
      {children}
    </div>
  );
  return (
    <div
      ref={first ? pageRef : undefined}
      className={`relative z-100 h-[calc(2*var(--page-height))] pb-[calc(0.5*var(--page-height))] ${
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
