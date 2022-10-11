import fastdom from 'fastdom';
import fastdomPromised from 'fastdom/extensions/fastdom-promised';

// eslint-disable-next-line import/no-default-export -- Historically used a default export here
export default fastdom.extend(fastdomPromised);
