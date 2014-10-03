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
    @include animation(fadeIn 5s ease-out);
    @include animation-delay(1s);
    @include background-size(100% 60%);
    @include border-radius(30px);
    @include box-shadow(none);
    @include box-sizing(border-box);
    @include column-width(300px);
    @include flex($flex-grow: 0, $flex-shrink: 1, $flex-basis: auto);
    @include flex-basis(auto);
    @include flex-direction(column);
    @include flex-display;
    @include flex-grow(0);
    @include rotate(90deg);
    @include sticky;
    @include transform(scale(1.3));
    @include transform-origin(0 50%);
    @include transition(width .2s ease-in-out);
}
```
