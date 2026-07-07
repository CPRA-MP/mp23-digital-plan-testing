import { CSSProperties, ReactNode, useContext, useLayoutEffect, useRef } from "react";
import { StoryLabelContext } from "./VideoStory";

export default function StoryLabel({
  children,
  startFrame,
  endFrame,
  pan = false,
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
  /** Extra classes appended to the default bottom-right bold-white-on-black look. */
  className?: string;
  /** Inline overrides (position, colors, etc.) layered on top of the defaults. */
  style?: CSSProperties;
}) {
  const register = useContext(StoryLabelContext);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!register || !ref.current) return;
    return register({ el: ref.current, startFrame, endFrame, pan });
  }, [register, startFrame, endFrame, pan]);

  return (
    <div
      ref={ref}
      className={`fixed z-150 bottom-[20px] right-[5dvw] bg-black text-white font-bold p-3 ${className}`}
      style={{ display: "none", ...style }}
    >
      {children}
    </div>
  );
}
