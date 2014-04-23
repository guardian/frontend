# Guss CSS3 Mixins

Part of the [Guss](https://github.com/guardian/guss) collection.

## Installation

```
bower install guss-css3 --save
```

```scss
@import "path/to/_css3.scss";
```

## Features

Provides Sass mixins for the most frequently used CSS3 features.


## Example

```scss
@include keyframes(fadeIn) {
    0%   { opacity: 0; }
    100% { opacity: 1; }
}

.element {
    @include box-sizing(border-box);
    @include transition(width .2s ease-in-out);
    @include transform(scale(1.3));
    @include transform-origin(0 50%);
    @include rotate(90deg);
    @include animation(fadeIn 5s ease-out);
    @include border-radius(30px);
    @include box-shadow(none);
    @include background-size(100% 60%);
    @include sticky;
    @include flex($flex-grow: 0, $flex-shrink: 1, $flex-basis: auto);
    @include flex-grow(0);
    @include flex-basis(auto);
}
```
