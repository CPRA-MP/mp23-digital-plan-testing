import { ReactNode } from "react";

export default function StoryPage({
  children,
  className = "",
  brief = false,
}: {
  children: ReactNode;
  className?: string;
  /** Shortens how long this page's sticky box stays pinned, without affecting where
   * the following page begins. Used for a page that's already visible on load, so it
   * starts scrolling away as soon as the user starts scrolling instead of holding for
   * a full page-height like the others. Works by nesting the sticky box in a shorter
   * div: position:sticky is clamped by its own parent's bottom edge, so shrinking just
   * that wrapper (not the outer spacer div) shortens the pin without moving siblings. */
  brief?: boolean;
}) {
  const stickyBox = (
    <div className="sticky top-[50%] translate-y-[-50%] bg-[#ffffffe0] text-black w-[40dvw] ml-[5dvw] p-3 cursor-auto [&>h2]:uppercase [&>h2]:text-lg [&>p]:leading-5 [&>*:last-child]:mb-0">
      {children}
    </div>
  );
  return (
    <div
      className={`relative z-100 h-[calc(2*var(--page-height))] pb-[calc(0.5*var(--page-height))] ${className}`}
    >
      {brief ? (
        <div className="h-[calc(0.65*var(--page-height))]">{stickyBox}</div>
      ) : (
        stickyBox
      )}
    </div>
  );
}
