import BrowserOnly from "@docusaurus/BrowserOnly";

export default function MiniPortal(props) {
  return (
    <BrowserOnly>
      {() => {
        const { default: MiniPortalImpl } = require("./MiniPortalImpl");
        return <MiniPortalImpl {...props} />;
      }}
    </BrowserOnly>
  );
}
