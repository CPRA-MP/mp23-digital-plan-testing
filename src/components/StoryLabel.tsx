import { CSSProperties, ReactNode, useContext, useLayoutEffect, useRef } from "react";
import { StoryLabelContext } from "./VideoStory";

export default function StoryLabel({
  children,
  startFrame,
  endFrame,
  pan = false,
  edgeArrow = false,
  className = "",
  style,
}: {
  children: ReactNode;
  /** Video frame at which the label becomes visible. */
  startFrame: number;
  /** Video frame at which the label is hidden again. */
  endFrame: number;
  /** Shifts the label horizontally in lockstep with the video as the user drags to
   * pan it, instead of staying fixed on screen like the default. */
  pan?: boolean;
  /** Only meaningful together with `pan`. When the label's anchor point pans off the
   * left or right edge of the screen, the label is pinned to that edge and the facing
   * side turns into a triangle pointing toward the off-screen anchor, so it stays
   * visible on narrow/wide aspect ratios instead of sliding out of view. */
  edgeArrow?: boolean;
  /** Extra classes appended to the default bottom-right bold-white-on-black look. */
  className?: string;
  /** Inline overrides (position, colors, etc.) layered on top of the defaults. */
  style?: CSSProperties;
}) {
  const register = useContext(StoryLabelContext);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!register || !ref.current) return;
    return register({ el: ref.current, startFrame, endFrame, pan, edgeArrow });
  }, [register, startFrame, endFrame, pan, edgeArrow]);

  return (
    <div
      ref={ref}
      data-arrow=""
      className={`group fixed z-150 bottom-[20px] right-[5dvw] bg-black text-white font-bold p-3 ${className}`}
      style={{ display: "none", ...style }}
    >
      {edgeArrow && (
        <>
          {/* VideoStory sets data-arrow="left"/"right" on this element to reveal the
           * matching triangle. bg-inherit keeps the arrow the same color as the label
           * even when className/style override the default black. */}
          <span
            aria-hidden
            className="hidden group-data-[arrow=left]:block absolute right-full top-0 bottom-0 w-3 bg-inherit [clip-path:polygon(100%_0,100%_100%,0_50%)]"
          />
          <span
            aria-hidden
            className="hidden group-data-[arrow=right]:block absolute left-full top-0 bottom-0 w-3 bg-inherit [clip-path:polygon(0_0,0_100%,100%_50%)]"
          />
        </>
      )}
      {children}
    </div>
  );
}
