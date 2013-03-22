# Javascript Style Guide

## General

 * Use UTF-8 encoding.
 * Indents are four spaces.
 * Opening braces are prefixed by a space.
 * Lines with nothing on them should have no whitespace.
 * There should be no whitespace at the end of a line.
 * Semicolons are not optional.
 * EOL semicolons are always followed by an endline.

```javascript
// No:
if(blah==="foo"){
  foo("bar","baz",{zoo:1})
}

// Yes:
if ( blah === "foo" ) {
    foo( "bar", "baz", {zoo: 1} );
}
```

## Naming

 * Function names, method names and variable names are camelCase.
 * Constructor names are PascalCase.
 * Symbolic constants are UPPER_CASE_WITH_UNDERSCORES.

## Syntax

 * if/else/for/while/try always have spaces, braces and always go on multiple lines.
 * Braces always used on blocks.
 * Strict equality checks (===) in favor of == whenever appropriate.

```javascript
// NO:
if ( true )
    blah();

// NONO:
if ( true ) blah()

// YES:
if ( true ) {
    blah();
}
```
 * Assignments in a declaration are on their own line. Declarations that don't have an assignment are listed together at the start of the declaration. For example:

```javascript
var a, b, c,
    test = true,
    test2 = false;
```
