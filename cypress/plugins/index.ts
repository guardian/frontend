import webpackPreprocessor from '@cypress/webpack-preprocessor';
import webpackConfig from '../cypress.webpack.config';

/**
 * @type {Cypress.PluginConfig}
 */
export default async (on: Cypress.PluginEvents, config: Cypress.ResolvedConfigOptions) => {
  // ... other prior config

  on('file:preprocessor', webpackPreprocessor({
    webpackOptions: webpackConfig
  }));

  return config;
};
