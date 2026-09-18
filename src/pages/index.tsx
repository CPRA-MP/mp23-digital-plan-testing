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
 * StoryPage wrappers aren't all the same height — each is its own frame span over
 * framesPerPageHeight, so they range from one page-height (the 11-frame gap) to
 * about nine (the 100-frame decade gaps). What they do share is where the pinned
 * window sits relative to their own top edge: the sticky card pins from half a
 * page-height above the wrapper's top down to its bottom, less the half-page-height
 * of padding and the card's own height. So aligning the wrapper's top edge to the
 * viewport's top edge (i.e. scrolling to its document-space top) lands half a
 * page-height into that window on every page — simpler and more robust than
 * computing the sticky box's exact pinned window from CSS custom properties. The
 * slack above shrinks as pages get shorter, so if framesPerPageHeight is ever
 * raised past the smallest frame gap this is the first thing to break. Falls back
 * to centering the heading itself for content that isn't a StoryPage card (e.g. the
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
        {/* 11 = the smallest frame gap between adjacent cards in _intro.mdx (the 11
        frames from 2024 Current Conditions at 111 to Understanding a Future Without
        Action at 122), the largest value that keeps every page at least a full
        page-height. Puts the 630-frame story at ~57 page-heights of scroll. */}
        <VideoStory
          src="https://api.mpdp.coastal.la.gov/static/video/intro-20260917-longer.mp4"
          framesPerPageHeight={11}
        >
          <MDXContent>
            <Intro />
          </MDXContent>
        </VideoStory>
      </main>
    </Layout>
  );
}
