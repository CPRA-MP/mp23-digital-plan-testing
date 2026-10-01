import type { ReactNode } from "react";
import { useLayoutEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import MDXContent from "@theme/MDXContent";

import VideoStory from "@site/src/components/VideoStory";
import { RESTING_BOTTOM_OFFSET_PX } from "@site/src/components/StoryPage";

import Intro from "./intro/_intro.mdx";

/** Docusaurus auto-slugs every markdown heading into an `id`, so `#visualizing-
 * coastal-change` does exist in the DOM — but it's on the `<h2>` nested inside a
 * StoryPage's `position: sticky` box, deep inside a tall scroll-driven wrapper.
 * The browser's own fragment-scroll (and a plain `scrollIntoView`) lands wherever
 * that heading's current, mid-transition position happens to be rather than the
 * pinned position the card settles into once scrolled to normally — so this walks
 * up to the card's StoryPage wrapper and scrolls to where that card first pins.
 *
 * The sticky box pins (top edge at the bottom of the window less
 * RESTING_BOTTOM_OFFSET_PX, before its visual-only translate) as soon as the
 * wrapper's top edge scrolls up to that line, so putting the wrapper's top there
 * lands exactly at the start of the pinned window. Unlike aiming partway into the
 * window, that holds however short the page is, as long as its pinned window isn't
 * negative. Falls back to centering the heading
 * itself for content that isn't a StoryPage card (e.g. the call-to-action page,
 * which renders in normal flow). */
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
        top: card
          ? docTop - (window.innerHeight - RESTING_BOTTOM_OFFSET_PX)
          : docTop + rect.height / 2 - window.innerHeight / 2,
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
        {/* 4 keeps every page at least a full page-height: the smallest frame gap
        between adjacent cards in _intro.mdx is 6 (Key Takeaway at 125 to the call to
        action at 131). Puts the 131-frame story at ~33 page-heights of scroll. */}
        <VideoStory
          src="https://api.mpdp.coastal.la.gov/static/video/intro-20261001.mp4"
          framesPerPageHeight={4}
        >
          <MDXContent>
            <Intro />
          </MDXContent>
        </VideoStory>
      </main>
    </Layout>
  );
}
