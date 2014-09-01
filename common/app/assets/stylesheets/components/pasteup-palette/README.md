pasteup-palette
===============

Part of the [Pasteup](https://github.com/guardian/pasteup) collection.

[View the demo](http://guardian.github.io/pasteup-palette)

## Installation

```
bower install pasteup-forms --save
```

## Usage

```scss
@import 'components/guss-colours/_colours';
@import 'components/pasteup-palette/_palette';

guss-colour(neutral-1, $pasteup-palette);
```

## Updating Documentation

- Install node dependencies: `npm install`
- Install Bower dependencies: `bower install --save`
- Add `<div class="b-*"></div>` to `index.html` with `*` being the name of the colour used in `_palette.scss`
- Compile and push to gh-pages using `grunt docs`
