# Guss Layout

Part of the [Guss](https://github.com/guardian/guss) collection.

## Installation

```
bower install guss-layout --save
```

```scss
@import 'path/to/_row.scss';
@import 'path/to/_columns.scss';

// Uncomment to output utility classes
// @include guss-row-utility;
// @include guss-columns-utility;
```

## Features

Low-level responsive layout patterns using flex-box, that falls back to floats where not supported.

Support can be defined via feature-detected class (e.g. using modernizr) or Sass variable (`$browser-supports-flexbox`).

## Demos

- Columns: http://sassmeister.com/gist/5c09ed0242085ba8d705
- Row pattern: http://sassmeister.com/gist/9b6033675b0f01de21f0
