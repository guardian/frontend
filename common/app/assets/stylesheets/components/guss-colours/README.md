# Guss Colours

Part of the [Guss](https://github.com/guardian/guss) collection.

<http://guardian.github.io/guss-colours>

## Installation

```
bower install guss-colours --save
```

## Usage

Use the Guss colour variables to declare app-specific global variables.

```scss
@import "path/to/_colours.scss";
@import "path/to/_helpers.scss";

$c-brand: guss-color(guardian-brand);

a {
    color: $c-brand;
}
```

## Contribute

### Add a new colour

1. Add `my-new-colour: #xxxxxx` to the `$guss-colours` map in `_colours.scss`
1. Add `<div class="b-my-new-colour"></div>` to `demo/index.html`
1. Compile styles using `sass demo/styles.scss:demo/styles.css`

### Commit and deploy

```bash
$ git commit -am "Commit message"
$ git checkout gh-pages
$ git merge -s subtree master
$ git push origin master gh-pages
```

## Nota Bene

Until Sass 3.3, colours like `#dcdcdc` are compiled to `gainsboro`.

As of Sass 3.4, compilation outputs colours using the authored notation.
