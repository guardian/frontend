

import { Banner } from "common/modules/ui/bannerPicker";
import { fetchBannerData, renderBanner, BannerDataResponse } from "common/modules/commercial/contributions-service";
import config from "lib/config";
import reportError from "lib/report-error";


const messageCode = 'reader-revenue-banner';

let data: BannerDataResponse | null | undefined = null;

const show = () => data ? renderBanner(data) : Promise.resolve(false);

const canShow = (): Promise<boolean> => {
  const forceBanner = window.location.search.includes('force-remote-banner=true');
  const enabled = config.get('switches.remoteBanner') || forceBanner;

  if (!enabled) {
    return Promise.resolve(false);
  }

  return fetchBannerData().then((response: BannerDataResponse | null | undefined) => {
    if (response) {
      data = response;
      return true;
    }
    return false;
  }).catch(error => {
    console.log(`Error fetching remote banner data: ${error}`);
    reportError(new Error(`Error fetching remote banner data: ${error}`), {}, false);
    return false;
  });
};


export const readerRevenueBanner: Banner = {
  id: messageCode,
  show,
  canShow
};