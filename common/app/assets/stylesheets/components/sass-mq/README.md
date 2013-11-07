# Media Queries, with Style

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
   `bower install sass-mq --save-dev`
   OR [Download _mq.scss](https://raw.github.com/guardian/sass-mq/master/_mq.scss)
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
        mobile:  300px,
        tablet:  600px,
        desktop: 900px,
        wide:    1260px,

        // Tweakpoints
        desktopAd: 810px,
        mobileLandscape: 480px
    );

    // Define the breakpoint from the $mq-breakpoints list that should
    // be used as the target width when outputting a static stylesheet
    // (i.e. when $mq-responsive is set to 'false').
    $mq-static-breakpoint: desktop;

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
.responsive {
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
    @include mq($to: tablet) {
        color: indianred;
    }
    @include mq($to: tablet, $and: '(orientation: landscape)') {
        color: crimson;
    }
    @include mq(mobile, desktop) {
        color: firebrick;
    }
}
```

### Adding custom breakpoints

```scss
$mq-breakpoints: mq-add-breakpoint(tvscreen, 1920px);

.hide-on-tv {
    @include mq(tvscreen) {
        display: none;
    }
}
```

## Test

1. cd into the `test` folder
2. run `sass test.scss test.css --force`
3. there should be a couple of warnings like this one, this is normal:

        WARNING: Assuming 640 to be in pixels, attempting to convert it into pixels for you
                 on line 25 of ../_mq.scss

4. if `test.css` hasn’t changed (run a `git diff` on it), tests pass

## Inspired By…

- https://github.com/alphagov/govuk_frontend_toolkit/blob/master/stylesheets/_conditionals.scss
- https://github.com/bits-sass/helpers-responsive/blob/master/_responsive.scss
- https://gist.github.com/magsout/5978325

## On Mobile-first CSS With Legacy Browser Support

- http://jakearchibald.github.io/sass-ie/
- http://nicolasgallagher.com/mobile-first-css-sass-and-ie/
- http://cognition.happycog.com/article/fall-back-to-the-cascade
- http://www.theguardian.com/info/developer-blog/2013/oct/14/mobile-first-responsive-ie8
