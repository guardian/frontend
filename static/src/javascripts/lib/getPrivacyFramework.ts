import { isInUsa } from "projects/common/modules/commercial/geo-utils.js";

let frameworks: {
  [key: string]: boolean;
};

export const getPrivacyFramework = () => {
  if (typeof frameworks === 'undefined') {
    const isInUS = isInUsa();

    frameworks = {
      ccpa: isInUS,
      tcfv2: !isInUS
    };
  }
  return frameworks;
};
