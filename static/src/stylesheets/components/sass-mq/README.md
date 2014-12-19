# Media Queries, with Style [![Build Status](https://travis-ci.org/sass-mq/sass-mq.svg?branch=master)](https://travis-ci.org/sass-mq/sass-mq)

`mq()` is a [Sass](http://sass-lang.com/ "Sass - Syntactically Awesome
Stylesheets") mixin that helps manipulating media queries in an elegant
way.

As developers and designers we think in pixels and device families, so the
`mq()` mixin accepts pixels, ems, keywords… and compiles into ems.

We use `mq()` at [the Guardian](http://www.theguardian.com/uk?view=mobile)
to effortlessly support older browsers and elegantly abstract media queries,
as illustrated in this article posted on the Guardian's developer blog:
[Mobile-first Responsive Web Design and IE8](http://www.theguardian.com/info/developer-blog/2013/oct/14/mobile-first-responsive-ie8).

## How to Use It

1. Install with [Bower](http://bower.io/ "BOWER: A package manager for the web"):
   `bower install sass-mq --save`
   OR [Download _mq.scss](https://raw.github.com/sass-mq/sass-mq/master/_mq.scss)
   to your Sass project.
2. Import the partial in your Sass files and override default settings
   with your own preferences before the file is imported:
    ```scss
    // To enable support for browsers that do not support @media queries,
    // (IE <= 8, Firefox <= 3, Opera <= 9) set $mq-responsive to false
    // Create a separate stylesheet served exclusively to these browsers,
    // meaning @media queries will be rasterized, relying on the cascade itself
    $mq-responsive: true;

    // Name your breakpoints in a way that creates a ubiquitous language
    // across team members. It will improve communication between
    // stakeholders, designers, developers, and testers.
    $mq-breakpoints: (
        mobile:  320px,
        tablet:  740px,
        desktop: 980px,
        wide:    1300px,

        // Tweakpoints
        desktopAd: 810px,
        mobileLandscape: 480px
    );

    // Define the breakpoint from the $mq-breakpoints list that should
    // be used as the target width when outputting a static stylesheet
    // (i.e. when $mq-responsive is set to 'false').
    $mq-static-breakpoint: desktop;

    // If you want to display the currently active breakpoint in the top
    // right corner of your site during development, add the breakpoints
    // to this list, ordered by width, e.g. (mobile, tablet, desktop).
    $mq-show-breakpoints: (mobile, mobileLandscape, tablet, desktop, wide);

    @import 'path/to/mq';
    ```
3. Play around with `mq()` (see below)

### Responsive mode ON (default)

`mq()` takes up to three optional parameters:

- `$from`: _inclusive_ `min-width` boundary
- `$until`: _exclusive_ `max-width` boundary
- `$and`: additional custom directives

Note that `$until` as a keyword is a hard limit i.e. it's breakpoint - 1.

```scss
.responsive {
    // Apply styling to mobile and upwards
    @include mq($from: mobile) {
        color: red;
    }
    // Apply styling up to devices smaller than tablets (exclude tablets)
    @include mq($until: tablet) {
        color: blue;
    }
    // Same thing, in landscape orientation
    @include mq($until: tablet, $and: '(orientation: landscape)') {
        color: hotpink;
    }
    // Apply styling to tablets up to desktop (exclude desktop)
    @include mq(tablet, desktop) {
        color: green;
    }
}
```

### Responsive mode OFF

To enable support for browsers that do not support `@media` queries,
(IE <= 8, Firefox <= 3, Opera <= 9) set `$mq-responsive: false`.

Tip: create a separate stylesheet served exclusively to these browsers,
for example with conditional comments.

When `@media` queries are rasterized, browsers rely on the cascade
itself. Learn more about this technique on [Jake’s blog](http://jakearchibald.github.io/sass-ie/ "IE-friendly mobile-first CSS with Sass 3.2").

To avoid rasterizing styles intended for displays larger than what those
older browsers typically run on, set `$mq-static-breakpoint` to match
a breakpoint from the `$mq-breakpoints` list. The default is
`desktop`.

The static output will only include `@media` queries that start at or
span this breakpoint and which have no custom `$and` directives:

```scss
$mq-responsive:        false;
$mq-static-breakpoint: desktop;

.static {
    // Queries that span or start at desktop are compiled:
    @include mq($from: mobile) {
        color: lawngreen;
    }
    @include mq(tablet, wide) {
        color: seagreen;
    }
    @include mq($from: desktop) {
        color: forestgreen;
    }

    // But these queries won’t be compiled:
    @include mq($until: tablet) {
        color: indianred;
    }
    @include mq($until: tablet, $and: '(orientation: landscape)') {
        color: crimson;
    }
    @include mq(mobile, desktop) {
        color: firebrick;
    }
}
```

### Adding custom breakpoints

```scss
@include mq-add-breakpoint(tvscreen, 1920px);

.hide-on-tv {
    @include mq(tvscreen) {
        display: none;
    }
}
```

### Seeing the currently active breakpoint

While developing, it can be nice to always know which breakpoint is
active. To achieve this, set the `$mq-show-breakpoints` variable to
be a list of the breakpoints you want to debug, ordered by width.
The name of the active breakpoint and its pixel and em values will
then be shown in the top right corner of the viewport.

![$mq-show-breakpoints](show-breakpoints.gif)

### Changing media type

By default, `mq()` uses `@media all` for its queries. If you want to
control this (e.g. to output styles for screens only), you can use the
`$mq-media-type` config option to change it (defaults to `all`):

#### SCSS
```scss
$mq-media-type: screen;

.screen-only-element {
    @include mq(mobile) {
        width: 300px;
    }
}
```

#### CSS output
```css
@media screen and (max-width: 19.99em) {
    .screen-only-element {
        width: 300px;
    }
}
```

### Seeing the currently active breakpoint

While developing, it can be nice to always know which breakpoint is
active. To achieve this, set the `$mq-show-breakpoints` variable to
be a list of the breakpoints you want to debug, ordered by width.
The name of the active breakpoint and its pixel and em values will
then be shown in the top right corner of the viewport.

![$mq-show-breakpoints](show-breakpoints.gif)

## Test

1. run:
    * Ruby Sass *and* LibSass:
    
            ./test.sh

    * Ruby Sass
    
            sass test/test.scss test/test.css --force --sourcemap=none --load-path=./

    * Libsass (using node-sass)
    
            node-sass test/test.scss test/test.css --force --sourcemap=none --include-path=./

2. there should be a couple of warnings like this one, this is normal:

        WARNING: Assuming 640 to be in pixels, attempting to convert it into pixels
         on line 74 of _mq.scss, in `mq'

3. if `git diff test/test.css` shows no changes, tests pass

## Generate the documentation

Sass MQ is documented using [SassDoc](http://sassdoc.com/):

    npm install -g sassdoc

Then, generate the documentation using:

    sassdoc . sassdoc --config .sassdocrc --no-prompt

## Inspired By…

- https://github.com/alphagov/govuk_frontend_toolkit/blob/master/stylesheets/_conditionals.scss
- https://github.com/bits-sass/helpers-responsive/blob/master/_responsive.scss
- https://gist.github.com/magsout/5978325

## On Mobile-first CSS With Legacy Browser Support

- http://jakearchibald.github.io/sass-ie/
- http://nicolasgallagher.com/mobile-first-css-sass-and-ie/
- http://cognition.happycog.com/article/fall-back-to-the-cascade
- http://www.theguardian.com/info/developer-blog/2013/oct/14/mobile-first-responsive-ie8
