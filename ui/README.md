# CSS componentisation

An investigation into the future architecture of theguardian.com.

Slack channel: [#dotcom-future](https://theguardian.slack.com/messages/C0JES5PEV)

## Compilation

### Prod

1. run `make ui-compile` from the project root.

This will create the following files:

- `ui/dist/ui.bundle.server.js`
- `static/target/javascripts/ui.bundle.browser.js`
- `static/target/javascripts/ui.bundle.browser.js.map`
- `static/target/javascripts/ui.bundle.browser.stats.html`

### Dev

1. run `make ui-watch` and wait for it to settle.
2. start the `archive` play application.
3. browse to http://localhost:3000/dev/ui.
