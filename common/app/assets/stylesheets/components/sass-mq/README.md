# Media Queries, with Style

`mq()` is a [Sass](http://sass-lang.com/ "Sass - Syntactically Awesome 
Stylesheets") mixin that helps manipulating media queries in an elegant
way.

As developers and designers we think in pixels and device families, so the
`mq()` mixin accepts pixels, ems, keywords… and compiles into ems.

## How to Use It

1. Install with [Bower](http://bower.io/ "BOWER: A package manager for the 
web"): `bower install sass-mq --save-dev`  
   OR [Download _mq.scss](https://raw.github.com/guardian/sass-mq/master/_mq.scss)
   to your Sass project.
2. Import the partial in your Sass files and override
default settings with your own preferences before the file is
imported:

```scss
// To output rules for browsers that do not support @media queries
// (IE <= 8, Firefox <= 3, Opera <= 9), set $mq-responsive to false
// Create a separate stylesheet served exclusively to these browsers,
// meaning @media queries will be rasterized, relying on the cascade itself
$mq-responsive: true;

// Name your breakpoints in a way that creates a ubiquitous language
// across team members. It will improve communication between
// stakeholders, designers, developers, and testers.
$mq-breakpoints: (
    (mobile  300px)
    (tablet  600px)
    (desktop 900px)
    (wide    1260px)

    // Tweakpoints
    (desktopAd 810px)
    (mobileLandscape 480px)
);

@import 'path/to/mq';
```
3. Play around with `mq()` (see below)

### Responsive mode ON (default)

`mq()` takes up to three optional parameters:

- `$from`: _inclusive_ `min-width` boundary
- `$to`: _exclusive_ `max-width` boundary
- `$and`: additional custom directives

Note that `$to` as a keyword is a hard limit. It's not applying styles to the
device (see examples below).

```scss
.element {
    // Apply styling to mobile and upwards
    @include mq($from: mobile) {
        color: red;
    }
    // Apply styling up to devices smaller than tablets (exclude tablets)
    @include mq($to: tablet) {
        color: blue;
    }
    // Same thing, in landscape orientation
    @include mq($to: tablet, $and: '(orientation: landscape)') {
        color: hotpink;
    }
    // Apply styling to tablets up to "desktop" (exclude desktop)
    @include mq(tablet, desktop) {
        color: green;
    }
}
```

### Responsive mode OFF

To enable support for browsers that do not support @media queries,
(IE <= 8, Firefox <= 3, Opera <= 9) set `$mq-responsive: false`.

Tip: create a separate stylesheet served exclusively to these browsers,
for example with conditional comments.
When @media queries are rasterized, browsers rely on the cascade
itself. Learn more about this technique on [Jake’s blog](http://jakearchibald.github.io/sass-ie/ "IE-friendly mobile-first CSS with Sass 3.2").

```scss
$mq-responsive: false;
.test {
    // `min-width` directives are compiled:
    @include mq($from: mobile) {
        color: red;
    }

    // But these calls won’t be compiled:
    @include mq($to: tablet) {
        color: blue;
    }
    @include mq($to: tablet, $and: '(orientation: landscape)') {
        color: hotpink;
    }
    @include mq(mobile, tablet) {
        color: green;
    }
}
```

## Test

1. cd into the `test` folder
2. run `sass test.scss test.css --force`
3. there should be a couple of warnings like this one, this is normal:

        WARNING: Assuming 10 to be in pixels, attempting to convert it into pixels for you
                 on line 24 of ../_mq.scss

4. if `test.css` hasn’t changed (run a `git diff` on it), tests pass

## Inspired by…

- https://github.com/alphagov/govuk_frontend_toolkit/blob/master/stylesheets/_conditionals.scss
- https://github.com/bits-sass/helpers-responsive/blob/master/_responsive.scss
- https://gist.github.com/magsout/5978325
