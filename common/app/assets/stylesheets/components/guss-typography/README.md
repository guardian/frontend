# Guss Typography

Part of the [Guss](https://github.com/guardian/guss) collection.

## Installation

```
bower install guss-typography --save
```

```scss
// Override defaults if needed
$sans-serif: "AgateSans", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
$serif: "EgyptianText", georgia, serif;
$serifheadline: "EgyptianHeadline", georgia, serif;
$text-sans: "TextSans", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;

$fs-headers: (
    16 20, // 1
    18 24, // 2
    20 28, // 3
    22 28, // 4
    24 28  // 5
);

$fs-headlines: (
    16 20, // 1
    20 24, // 2
    24 28, // 3
    28 32, // 4
    32 36, // 5
    36 40, // 6
    40 44, // 7
    44 48  // 8
);

$fs-bodyHeadings: (
    14 22, // 1
    16 24, // 2
    18 28, // 3
    20 28  // 4
);

$fs-bodyCopy: (
    14 20, // 1
    14 22, // 2
    16 24, // 3
    18 28  // 4
);

$fs-data: (
    11 14, // 1
    12 14, // 2
    13 16, // 3
    14 18, // 4
    16 20, // 5
    18 22  // 6
);

$fs-textsans: (
    12 16, // 1
    13 18, // 2
    14 20, // 3
    14 22  // 4
);

@import "path/to/_helpers.scss";
@import "path/to/_font-scale.scss";
```

## Features

Provides Sass mixins and values for the Guardian typography & font scale.

![Font scale](font-scale.png)
