import { ReactNode } from "react";
import StoryPage from "./StoryPage";

/** The opening page of a story: a `.left` block (title + `.subtitle`) sitting
 * beside a `.right` column of intro copy, instead of the single boxed card the
 * other pages use. Wraps StoryPage rather than replacing it so it keeps the
 * `first` page's sticky/centering behavior.
 *
 * `.left` and `.right` are two real sibling elements (not grid rows split across
 * a shared track) so their heights are independent — `.right`'s copy can run
 * much longer than the title block without pulling extra height into whatever
 * sits above the subtitle. */
export default function StoryTitlePage({ children }: { children: ReactNode }) {
  return (
    <StoryPage
      first
      className={[
        // StoryPage's default box (white card, capped width, padding) has the same
        // specificity as these overrides, so `!` forces them to win regardless of
        // which rule Tailwind happens to emit first.
        "!bg-transparent !w-[90dvw] !max-w-6xl !p-0",
        "grid grid-cols-1 gap-y-6 md:grid-cols-[1fr_minmax(14rem,22rem)] md:items-start",
        "md:gap-x-10 lg:gap-x-14",
        "[&_h1]:m-0 [&_h1]:mb-2 [&_h1]:font-extrabold [&_h1]:uppercase [&_h1]:leading-tight [&_h1]:text-teal-700",
        "[&_h1]:text-4xl sm:[&_h1]:text-5xl md:[&_h1]:text-6xl lg:[&_h1]:text-7xl",
        "[&_.subtitle]:block [&_.subtitle]:font-medium [&_.subtitle]:text-teal-700",
        "[&_.subtitle]:text-lg sm:[&_.subtitle]:text-xl md:[&_.subtitle]:text-2xl lg:[&_.subtitle]:text-3xl",
        "[&_.right]:text-slate-800",
        "[&_.right_p]:mb-3 [&_.right_p:last-child]:mb-0 [&_.right_p]:leading-snug",
        "[&_.right_p]:text-sm sm:[&_.right_p]:text-base lg:[&_.right_p]:text-lg",
      ].join(" ")}
    >
      {children}
    </StoryPage>
  );
}
