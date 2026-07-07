import type { ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import MDXContent from "@theme/MDXContent";

import VideoStory from "@site/src/components/VideoStory";

import Intro from "./intro/_intro.mdx";

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main id="overview">
        <VideoStory src="https://api.mpdp.coastal.la.gov/static/video/placeholder-prototype-10fps-extended-4-1ratio.mp4">
          <MDXContent>
            <Intro />
          </MDXContent>
        </VideoStory>
      </main>
    </Layout>
  );
}
