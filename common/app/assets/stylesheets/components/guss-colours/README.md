# Guss Colours

Part of the [Guss](https://github.com/guardian/guss) collection.

<http://guardian.github.io/guss-colours>

## Installation

```bash
$ bower install guss-colours --save
```

## Usage

Use the Guss colour variables to declare app-specific global variables.

```scss
@import 'path/to/_colours.scss';

$c-brand: guss-colour(guardian-brand);

a {
    color: $c-brand;
}
```

## Contributing

### 1. Edit or add a new colour

1. Edit an existing colour or add `my-new-colour: #xxxxxx` to the `$guss-colours` map in `_colours.scss`
1. Add `<div class="b-my-new-colour"></div>` to `demo/index.html`
1. Compile styles using `sass demo/demo.scss:demo/demo.css`

### 2. Commit and deploy

```bash
$ git commit -am "Commit message"
$ git checkout gh-pages
$ git merge -s subtree master
$ git push origin master gh-pages
```

## Nota Bene

Until Sass 3.3, colours like `#dcdcdc` are compiled to `gainsboro`.

As of Sass 3.4, compilation outputs colours using the authored notation.
