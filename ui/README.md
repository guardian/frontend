# CSS componentisation

An investigation into the future architecture of theguardian.com.

Slack channel: [#dotcom-future](https://theguardian.slack.com/messages/C0JES5PEV)

## Dev

1. start the `article` play application.
2. run `make ui-dev`.
3. browse to http://localhost:3000/render/js.

## Prod

1. run `make ui-bundle`.

This will create the following files:

- `ui/dist/ui.bundle.server.js`
- `static/target/javascripts/ui.bundle.browser.js`
- `static/target/javascripts/ui.bundle.browser.js.map`
- `static/target/javascripts/ui.bundle.browser.stats.html`
