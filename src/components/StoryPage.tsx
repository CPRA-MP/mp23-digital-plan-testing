import { ReactNode } from "react";

export default function StoryPage({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-100 h-[calc(2_*_var(--page-height))] pb-[calc(0.5_*_var(--page-height))]">
      <div className="sticky top-[50%] translate-y-[-50%] bg-[#ffffffe0] text-black w-[40dvw] ml-[5dvw] p-3 cursor-auto [&>h2]:uppercase [&>h2]:text-lg [&>p]:leading-5 [&>*:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}
