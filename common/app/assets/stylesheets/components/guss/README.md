# Guss

## Installation

```
bower install guss --save
```

```scss
@import 'bower_components/sass-mq/_mq';
@import 'bower_components/guss-css3/_css3';
@import 'bower_components/guss-rem/_rem';
@import 'bower_components/guss-grid-system/_grid-system';
@import 'bower_components/guss-layout/_row';
@import 'bower_components/guss-layout/_columns';
@import 'bower_components/guss-typography/_typography';
@import 'bower_components/guss-colours/_colours';
@import 'bower_components/guss-webfonts/_webfonts';
```

## Features

Guss (Guardian Style Sheets) is a collection of universal components re-usable across
Guardian web products.

It is inspired by Nicolas Gallagher's [Suit framework](https://github.com/suitcss/suit).

## Utilities

- [guss-css3](https://github.com/guardian/guss-css3): Sass mixins for the most frequently used CSS3 features
- [guss-rem](https://github.com/guardian/guss-rem): Use rem units in your CSS in a retro-compatible way

## Components

- [guss-grid-system](https://github.com/guardian/guss-grid-system): Grid system
- [guss-layout](https://github.com/guardian/guss-layout): Responsive Layout patterns
- [guss-typography](https://github.com/guardian/guss-typography) Font scale and default typography settings
- [guss-colours](https://github.com/guardian/guss-colours): Helpers for working with colours
- [guss-webfonts](https://github.com/guardian/guss-webfonts): Guardian Webfonts

## Documentation

Use [SassDoc](https://github.com/SassDoc/sassdoc) to build the documentation locally:

1. Install SassDoc: `npm install sassdoc -g`
2. Install Guss: `bower install guss`
3. Build the docs: `sassdoc bower_components sassdoc --config bower_components/guss/sassdoc.json`
4. Read the docs: `open sassdoc/index.html`
