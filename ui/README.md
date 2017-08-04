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

## Howtos

### Use an SVG

Import the SVG as normal.

```jsx
import MySVG from './my-svg.svg';
```

It will be loaded using `frontend/ui/__tools__/svg-loader.js`, which runs it through SVGO then returns it as a JSX object.

You can use the JSXified SVG as a normal JSX import:

```xml
<!-- my-svg.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="60"><path ... /></svg>
```

```jsx
import MySVG from './my-svg.svg';

export default () => <div><MySVG /></div>;

// <div><svg width="320" height="60"><path ... /></svg></div>

```
#### Styling the SVG
It will also respond to an object on a `block-styles` prop:

```jsx
<MySVG block-styles={{ red: { fill: "red" } }} />;
```
If a node in the original SVG has a `data-block` attribute, the loader will look for a key in the `styles` object that matches the value of `data-block`, and apply the styles inline:

```xml
<!-- my-svg.svg -->
<svg><path data-block="red" /></svg>
```

```jsx
import MySVG from './my-svg.svg';

const styles = {
	red: { color: 'red' }
}

export default () => <MySVG block-styles={styles} />

// <svg><path data-block="red" style="color: red" /></svg>

```

You can use Sass in a similar way to non-SVG components:

```xml
<!-- my-svg.svg -->
<svg><path data-block="red" /></svg>
```

```scss
// styles.js.scss
red {
    fill: 'red'
}
```

```jsx
import MySVG from './my-svg.svg';
import styles from './styles.js.scss';

export default () => <MySVG block-styles={styles} />

// <svg><path data-block="red" style="fill: red" /></svg>

```
