# Guss Utilities: rem

Part of the [Guss](https://github.com/guardian/guss) collection.

## Requirements

- Sass 3.3.0 or higher

## Installation

```
bower install guss-rem --save
```

```scss
@import "path/to/_rem.scss";
```

## Features

Use rem units in your CSS in a retro-compatible way.

- `rem()` is a Sass function converts pixel values into their rem equivalents
- `rem(())` is a Sass mixin that takes a set of properties and outputs their
  equivalent in rem units with a fallback in pixels for older browsers.

Calculations are done assuming a 10px baseline on the `:root` element (ex: `<html style="font-size: 62.5%">`). You can adjust this baseline by changing the value of `$guss-rem-baseline` before importing this Sass partial.

## Example

```scss
.test {
    @include rem((
        padding: 20px 0 0px 3vh,
        margin: 0 auto 20px,
        width: 300px,
        height: 350px,
        line-height: 20px
    ));
    height: rem(20px);
}
```

Outputs:

```css
.test {
  padding: 20px 0 0px 3vh;
  padding: 2rem 0 0 3vh;
  margin: 0 auto 20px;
  margin: 0 auto 2rem;
  width: 300px;
  width: 30rem;
  height: 350px;
  height: 35rem;
  line-height: 20px;
  line-height: 2rem;
  height: 2rem;
}
```
