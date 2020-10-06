// @flow
import fastdom from 'fastdom';
import fastdomPromised from 'fastdom/extensions/fastdom-promised';

const { measure, mutate, clear } = fastdom.extend(fastdomPromised);

export default { measure, mutate, clear }
