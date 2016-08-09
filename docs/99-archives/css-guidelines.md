We have a mixture of CSS rules covering project-specific, department-specific and framework-specific. They work as follows:

## General CSS style guidelines 
**(To be used across all Guardian products in general)**

These can be found [as part of Pasteup's CSS guidelines](https://github.com/guardian/pasteup/blob/master/less/README.md)

## Framework specific CSS guidelines 
**(Used where applicable)**

If working on anything non-trivial (eg. hundreds of lines or more of CSS and/or multiple CSS files), we encourage the use of @snookca's [SMACSS framework](http://smacss.com/). This is well-documented on the official site, but we also offer [a brief internal version](https://github.com/guardian/frontend/wiki/SMACSS:-architecture-principles-for-CSS), too.

As for naming conventions, we use a [BEM](http://www.bem.info)-like notation.

BEM stands for Block, Element, Modifier.

- Block (e.g.: navigation)
- Element (e.g.: item)
- Modifier (e.g.: active)

With this naming convention:

```css
component-name {}
component-name--modifier-name {}
component-name__sub-object {}
component-name__sub-object--modifier-name {}
```

We would have:

```css
.navigation {}
.navigation__item {}
.navigation__item--active {}
```

More information about BEM and its benefits in this short blog post: [Fifty Shades of BEM](http://blog.kaelig.fr/post/48196348743/fifty-shades-of-bem). Find some more examples in Nicolas Gallagher's [Suitcss component naming guidelines](https://github.com/suitcss/suit/blob/master/doc/components.md).

## Project specific CSS guidelines
**(Should be used only when appropriate, alongside the rules above.)**

* Module naming must be consistent, and aligned with the name of the HTML fragment (where used). For example, an HTML fragment called `sport-trailblock.scala.html` would use CSS module classnames like `.sport-trailblock-table` or `.sport-trailblock-header` etc.

* We use a class of `.from-content-api` as a wrapper around any HTML that is outside our direct control -- eg, code input by editors into the article body. This means that we write element selectors prefixed with this wrapper, eg: `.from-content-api blockquote`, as we have no other way of targeting these elements besides pre-processing the HTML from the API. This breaks SMACSS guidelines but we feel is an acceptable breach of the rules.

* We use single element selectors sparingly, if at all. Save these for reset/normalise stylesheets. This is standard SMACSS philosophy.

* We have a single `_vars.scss` file which contains any CSS variables we'd like to declare. Add yours there. These are currently grouped into themes (eg. colours, zones, box model values etc.) and we try to order them alphabetically within these groups for ease of reference. Don't declare variables in individual Sass files unless completely module-specific; this just makes them harder to maintain and track down, and can introduce problems with how Play framework parses and concatenates Sass files.

* We only use `@import` statements in files in the root of the `stylesheets` directory, like `global.scss`. Not in files contained in sub-directories.

* We document any classes defined in `_helpers.scss` in our style guide to indicate what they do, and as a kind of vocabulary for new developers to learn how to solve common tasks (clearfix, JS-only content, etc).

* As SMACSS suggests, if you find yourself using parent selectors to change something (eg `.module-foo .module-bar-heading`, you're doing it wrong -- subclass it! Add a class of `.module-foo__heading` (or whatever with the BEM notation) to the thing you're targeting rather than creating future headaches by writing unpredictable selectors with high specificity. This may feel "wrong" at first but gradually becomes second nature and allows much more confident use of CSS.

* We declare any mixins at the top of the CSS declaration block -- this means that if we want to override any of the properties of the mixed-in class, we can do so below.

## Comments

Our commenting style is inspired by JavaDoc for the most part.

```scss
/* ==========================================================================
   I am an important banner
   ========================================================================== */

/* I am a delimiter
   ========================================================================== */

/**
 * I am a documentation block
 * of maximum 80 characters per line
 * for readability reasons
 */

.element {
    zoom: 1; /* I describe what is going on here */
    @include transform(translateZ(0)); // Same here, but not visible in output
                                       // and on multiple lines
}
```
