# eslint-plugin-guardian-frontend

These are eslint rules we've written to catch common patterns in our JS we'd rather avoid, and which cannot be caught by 3rd party rules.

Generally, that will be project-specific stuff e.g. preferring the `config` module over the object on `window.guardian`.

## Writing a rule

They're not that intuitive to write, ask around if you're lost.

1. Add a new test e.g. `__tests__/my-new-rule.js`.
  - ask in the [dotcom-platform slack channel](https://theguardian.slack.com/messages/dotcom-platform) if you need some guidance, or see the existing ones
2. Confirm it fails by running `npm test` from this directory.
  - tests are run with [Jest](https://facebook.github.io/jest/docs/getting-started.html)
  - you can run individual tests with `npm test -- ./__tests__/my-new-rule.js`
3. Write your rule till it passes!
4. Since we have to install the package from the local FS with `yarn`, you'll need to bump the version in `package.json` to pick your new rule up.
