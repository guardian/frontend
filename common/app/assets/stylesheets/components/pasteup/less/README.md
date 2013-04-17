# CSS Style Guide

## General

 * Use UTF-8 encoding.
 * Indents are four spaces.
 * Lines with nothing on them should have no whitespace.
 * There should be no whitespace at the end of a line.
 * class names and ids are lowercase and separated by hypens.

## Formatting

 * No units for 0 values.
 * Property name colon is always followed by a space.
 * Separate all selectors and declarations by new lines.
 * Property value pairs always ended with semicolon.
 * Opening curly braces are on the same line as the selector.
 * Do not use quotation marks with url().


```css
/* NO: */
.searchCinema
{
	margin:0px;
}

/* YES: */
.latest-reviews {
	margin: 0;
}
```

## Shorthand

 * Be suspicious of shorthand as it clobbers by default.

## Selectors

 * Avoid ID selectors, as they complicate specificity and hinder reuse.
 * Avoid element selectors as they tightly couple CSS to document structure.

## LESS Syntax

 * Avoid LESS syntax except for global level colour variables.
 * Do not use mixins except for cross-browser vendor prefixing.
 * Do not use nested rules.
 * Do not use functions and operations.


