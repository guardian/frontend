
import { init as initDrama } from "admin/bootstraps/drama";
import { initABTests } from "admin/bootstraps/abtests";
import { initRadiator } from "admin/bootstraps/radiator";
import domReady from "domready";

domReady(() => {
  switch (window.location.pathname) {
    case '/analytics/abtests':
      initABTests();
      break;

    case '/dev/switchboard':
      initDrama();
      break;

    case '/radiator':
      initRadiator();
      break;

    default: // do nothing
  }
});