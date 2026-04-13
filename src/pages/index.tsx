import type { ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";
import VideoStory from "../components/VideoStory";
import StoryPage from "../components/StoryPage";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header
      className={clsx(
        "hero hero--primary h-[--page-height]",
        styles.heroBanner,
      )}
    >
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <VideoStory src="https://api.mpdp.coastal.la.gov/static/video/fwoa-land-change-20260413.mp4">
          <StoryPage>
            <h2>Page 1</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
              blandit iaculis pharetra. Pellentesque maximus mollis rhoncus.
              Suspendisse finibus mi sem, quis eleifend nulla sagittis a.
            </p>
          </StoryPage>
          <StoryPage>
            <h2>Page 2</h2>
            <p>
              In viverra venenatis nibh, a porttitor neque egestas a. Sed ac
              dolor purus. Ut mattis fringilla augue eu accumsan. Curabitur
              sollicitudin quis nisi ut tempor. Nam non bibendum magna, in
              consectetur lorem. Suspendisse fermentum sit amet turpis eget
              consequat. Nulla facilisi. Aenean aliquam mattis vestibulum.
            </p>
          </StoryPage>
          <StoryPage>
            <h2>Page 3</h2>
            <p>
              Nam suscipit, tellus in pulvinar gravida, lectus lectus aliquet
              orci, id porta arcu elit ultricies augue. Quisque pellentesque,
              risus et accumsan egestas, sapien magna pharetra arcu, ac euismod
              erat est vel tortor. Quisque et nibh quam. Integer auctor leo sed
              vestibulum pharetra. In id sodales lectus.
            </p>
          </StoryPage>
        </VideoStory>
      </main>
    </Layout>
  );
}
