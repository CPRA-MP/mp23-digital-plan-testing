import type { ReactNode } from "react";
import { useLayoutEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import MDXContent from "@theme/MDXContent";

import VideoStory from "@site/src/components/VideoStory";

import Intro from "./intro/_intro.mdx";

/** Docusaurus auto-slugs every markdown heading into an `id`, so `#visualizing-
 * coastal-change` does exist in the DOM — but it's on the `<h2>` nested inside a
 * StoryPage's `position: sticky` box, deep inside a tall scroll-driven wrapper.
 * The browser's own fragment-scroll (and a plain `scrollIntoView`) lands wherever
 * that heading's current, mid-transition position happens to be rather than the
 * pinned-centered position the card settles into once scrolled to normally — so
 * this walks up to the card's StoryPage wrapper and scrolls that into the pinned
 * position instead.
 *
 * Every StoryPage wrapper shares the same geometry (2x page-height, holding the
 * sticky card centered for the ~first 45% of that height before it releases and
 * scrolls away with the rest of the page) since none of the `<StoryPage>` usages
 * in _intro.mdx pass startFrame/endFrame. Aligning the wrapper's own top edge to
 * the viewport's top edge (i.e. scrolling to its document-space top) lands
 * comfortably inside that pinned window (empirically ~340-420px of slack on
 * either side), which is simpler and more robust than trying to compute the
 * sticky box's exact pinned window from CSS custom properties. Falls back to
 * centering the heading itself for content that isn't a StoryPage card (e.g. the
 * call-to-action page, which renders in normal flow). */
function useScrollToHashCard() {
  useLayoutEffect(() => {
    function centerHashTarget() {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const heading = document.getElementById(id);
      if (!heading) return;
      const card = heading.closest<HTMLElement>("[data-story-page]");
      const rect = (card ?? heading).getBoundingClientRect();
      const docTop = rect.top + window.scrollY;
      window.scrollTo({
        top: card ? docTop : docTop + rect.height / 2 - window.innerHeight / 2,
        behavior: "instant",
      });
    }
    // Two rAFs: the first page's height can still be adjusting (StoryPage measures
    // itself via a ResizeObserver, which delivers after layout but isn't guaranteed
    // to land before a single rAF fires), which would shift every card below it.
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(centerHashTarget);
    });
    window.addEventListener("hashchange", centerHashTarget);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", centerHashTarget);
    };
  }, []);
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  useScrollToHashCard();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main id="overview">
        <VideoStory src="https://api.mpdp.coastal.la.gov/static/video/intro-20260909-05years.mp4">
          <MDXContent>
            <Intro />
          </MDXContent>
        </VideoStory>
      </main>
    </Layout>
  );
}
