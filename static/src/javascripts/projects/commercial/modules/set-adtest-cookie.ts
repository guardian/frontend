import { getUrlVars } from "../../../lib/url";
import { removeCookie, addCookie } from "@guardian/libs";

const init = () => {
  const queryParams = getUrlVars();

  if (queryParams.adtest === "clear") {
    removeCookie({ name: "adtest" });
  } else if (queryParams.adtest) {
    setCookie({
      name: "adtest",
      value: encodeURIComponent(queryParams.adtest),
      daysToLive: 10,
    });
  }
  return Promise.resolve();
};

export { init };
