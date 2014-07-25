# Guss Typography

Part of the [Guss](https://github.com/guardian/guss) collection.

## Installation

```
bower install guss-typography --save
```

```scss
// Override defaults if needed
$f-data: 'Guardian Agate Sans 1 Web', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
$f-serif-text: 'Guardian Text Egyptian Web', Georgia, serif;
$f-serif-headline: 'Guardian Egyptian Web', Georgia, serif;
$f-sans-serif-text: 'Guardian Text Sans Web', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
$f-sans-serif-headline: 'Guardian Sans Web', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;

$fs-headers: (
    16 20, // 1
    18 24, // 2
    20 28, // 3
    22 28, // 4
    24 28, // 5
);

$fs-headlines: (
    14 18, // 1
    16 20, // 2
    20 24, // 3
    24 28, // 4
    28 32, // 5
    32 36, // 6
    36 40, // 7
    40 44, // 8
    44 48, // 9
);

$fs-bodyHeadings: (
    14 22, // 1
    16 24, // 2
    18 28, // 3
    20 28, // 4
);

$fs-bodyCopy: (
    14 20, // 1
    16 24, // 2
    18 28, // 3
);

$fs-data: (
    11 14, // 1
    12 14, // 2
    13 16, // 3
    14 18, // 4
    16 20, // 5
    18 22, // 6
);

$fs-textSans: (
    12 16, // 1
    13 18, // 2
    14 20, // 3
    14 22, // 4
);

@import "path/to/_helpers.scss";
@import "path/to/_font-scale.scss";
```

## Suggested default type settings

To kick start a project with scalable typography,
here are the suggested default global type settings:

```scss
@include guss-typography-defaults;
```

Compiles to:

```css
html {
    font-family: "Guardian Text Egyptian Web", Georgia, serif;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-size: 62.5%;
    font-size: calc(1em * .625);
}
body {
    font-size: 1.6em;
    line-height: 1.5;
}
```

## Usage

Refer yourself to the matrix below, using these principles:

```scss
h1 {
    @include fs-headline(4);
}
p {
    @include fs-bodyCopy(3);
}
.small-text {
    // Output font-size and line-height only
    @include fs-bodyCopy(1, $size-only: true);
}
.body-heading {
    // Output font family and weight settings only
    @include f-bodyHeading;
}
```

## Features

Provides Sass mixins and values for the Guardian typography & font scale.

![Font scale](font-scale.png)

### Nota Bene

`Guardian Sans Web` is not currently integrated into our font scale, hence no `fs-` mixin; currently we're just using it as a replacement font in a few places.
