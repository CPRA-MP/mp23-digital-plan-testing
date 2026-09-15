import { ReactNode } from "react";

/** The closing page of a story: a wide two-column layout (a `.left` block of
 * numbered category cards plus a `.right` call-to-action column) instead of the
 * single boxed card the other StoryPages use. Unlike StoryPage, this renders in
 * normal document flow rather than a sticky/centered box — its content is much
 * taller than a typical card, and StoryPage's `top-50%`/`translate-y-[-50%]`
 * centering pushes anything taller than the viewport off the top of the screen.
 * A `min-h-dvh` flex-centered section grows to fit tall content instead of
 * clipping it, while still sitting inside the video-background's pinned scroll
 * range like every other page. */
export default function StoryCallToActionPage({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-100 min-h-dvh flex items-center py-12">
      <div
        className={[
          "text-white w-[92dvw] max-w-6xl mx-auto",
          "grid grid-cols-1 gap-y-10 md:grid-cols-[1.7fr_1fr] md:gap-x-12",

          // .right stretches to the height of the taller column (the default grid
          // stretch, now that items-start isn't forcing both columns to their own
          // natural height) so its border-left divider runs the full height of
          // whichever side is taller, and its CTA button can anchor to the shared
          // bottom edge instead of trailing right under its (shorter) paragraph.
          "[&_.right]:md:border-l [&_.right]:md:border-white/30 [&_.right]:md:pl-12",
          "[&_.right]:flex [&_.right]:flex-col",

          // Section headings ("Start Exploring", "Dive Deeper", the .right heading)
          "[&_h2]:m-0 [&_h2]:mb-3 [&_h2]:font-extrabold [&_h2]:leading-tight [&_h2]:text-white",
          "[&_h2]:text-xl sm:[&_h2]:text-2xl md:[&_h2]:text-3xl",

          // Section body copy
          "[&_.left>p]:text-white [&_.right>p]:text-white [&_.dive-deeper_p]:text-white",
          "[&_.left>p]:m-0 [&_.right>p]:m-0 [&_.dive-deeper_p]:m-0",
          "[&_.left>p]:text-sm sm:[&_.left>p]:text-base lg:[&_.left>p]:text-lg",
          "[&_.right>p]:text-sm sm:[&_.right>p]:text-base lg:[&_.right>p]:text-lg",
          "[&_.dive-deeper_p]:text-sm sm:[&_.dive-deeper_p]:text-base lg:[&_.dive-deeper_p]:text-lg",

          // Dive Deeper: heading spans the full row, then the paragraph and its
          // button sit side by side (button right-aligned next to the copy) on
          // desktop, matching the mockup — stacked normally on narrow screens
          // items-end (not center): the button should share the paragraph's
          // bottom edge, which is also .left's bottom edge that the .right
          // button's mt-auto anchors to — centering would end the button above
          // that shared edge whenever the paragraph wraps to more lines than the
          // button is tall, breaking the two-button alignment below.
          "[&_.dive-deeper]:md:grid [&_.dive-deeper]:md:grid-cols-[1fr_auto] [&_.dive-deeper]:md:items-end [&_.dive-deeper]:md:gap-x-8",
          "[&_.dive-deeper_h2]:md:col-span-2",

          // 2x2 grid of category cards
          "[&_.categories]:grid [&_.categories]:grid-cols-1 [&_.categories]:sm:grid-cols-2",
          "[&_.categories]:gap-4 [&_.categories]:my-6",
          "[&_.category]:flex [&_.category]:flex-col [&_.category]:gap-2",
          "[&_.category]:bg-white/15 [&_.category]:backdrop-blur-sm [&_.category]:rounded-xl [&_.category]:p-4",

          // number badge + title row
          "[&_.category-head]:flex [&_.category-head]:items-start [&_.category-head]:gap-3 [&_.category-head]:mb-1",
          "[&_.num]:flex [&_.num]:shrink-0 [&_.num]:items-center [&_.num]:justify-center",
          "[&_.num]:w-7 [&_.num]:h-7 [&_.num]:rounded-md [&_.num]:bg-teal-300",
          "[&_.num]:text-teal-950 [&_.num]:font-bold [&_.num]:text-sm",
          "[&_.category-head_h3]:m-0 [&_.category-head_h3]:font-bold [&_.category-head_h3]:leading-snug [&_.category-head_h3]:text-white",
          "[&_.category-head_h3]:text-sm sm:[&_.category-head_h3]:text-base",

          // checklist items — indented (ml-10 = num's w-7 + gap-3) so the checkbox
          // marks and item text line up under the heading text, not the number badge
          "[&_.category_ul]:list-none [&_.category_ul]:m-0 [&_.category_ul]:p-0 [&_.category_ul]:mb-4",
          "[&_.category_ul]:ml-10 [&_.category_ul]:flex [&_.category_ul]:flex-col [&_.category_ul]:gap-1.5",
          "[&_.category_li]:relative [&_.category_li]:pl-5 [&_.category_li]:italic",
          "[&_.category_li]:text-white [&_.category_li]:text-xs sm:[&_.category_li]:text-sm",
          "[&_.category_li]:before:content-[''] [&_.category_li]:before:absolute [&_.category_li]:before:left-0",
          "[&_.category_li]:before:top-[3px] [&_.category_li]:before:w-3 [&_.category_li]:before:h-3",
          "[&_.category_li]:before:rounded-[2px] [&_.category_li]:before:bg-white",

          // white pill button on each card
          "[&_.browse-all]:self-end [&_.browse-all]:mt-auto [&_.browse-all]:no-underline",
          "[&_.browse-all]:bg-white [&_.browse-all]:hover:bg-white/90 [&_.browse-all]:text-teal-700",
          "[&_.browse-all]:font-semibold [&_.browse-all]:rounded-full",
          "[&_.browse-all]:px-4 [&_.browse-all]:py-1.5 [&_.browse-all]:text-xs sm:[&_.browse-all]:text-sm",

          // orange CTA buttons. The .right one gets mt-auto so it anchors to the
          // bottom of .right's stretched box, lining up with the .left button
          // (which sits at .left's natural bottom, since .left is the taller column)
          "[&_.cta-button]:inline-block [&_.cta-button]:no-underline [&_.cta-button]:mt-5",
          // .right is a flex column, where align-self defaults to stretch — without
          // self-start the button would stretch to the column's full width
          "[&_.right_.cta-button]:self-start [&_.right_.cta-button]:mt-auto",
          "[&_.dive-deeper_.cta-button]:md:mt-0",
          "[&_.cta-button]:bg-orange-400 [&_.cta-button]:hover:bg-orange-300 [&_.cta-button]:text-white",
          "[&_.cta-button]:font-semibold [&_.cta-button]:rounded-full",
          "[&_.cta-button]:px-6 [&_.cta-button]:py-2.5 [&_.cta-button]:text-sm sm:[&_.cta-button]:text-base",

          "[&_.dive-deeper]:mt-8",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
