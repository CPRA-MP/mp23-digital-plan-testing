import type { ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import MDXContent from "@theme/MDXContent";

import VideoStory from "@site/src/components/VideoStory";

import Intro from "./intro/_intro_shorter.mdx";

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main id="overview">
        {/* 6 = the smallest frame gap between adjacent cards in _intro_shorter.mdx,
        the largest value that keeps every page at least a full page-height. Puts the
        207-frame story at ~35 page-heights of scroll. See VideoStory's prop docs. */}
        <VideoStory
          src="https://api.mpdp.coastal.la.gov/static/video/intro-20260917-shorter.mp4"
          framesPerPageHeight={6}
        >
          <MDXContent>
            <Intro />
          </MDXContent>
        </VideoStory>
      </main>
    </Layout>
  );
}
