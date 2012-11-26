Qwery - The Tiny Selector Engine
-----
Qwery is a 1k selector query engine allowing you to select elements with CSS1 & CSS2 queries, with the exception of (commonly used) [attribute selectors](http://www.w3.org/TR/css3-selectors/#attribute-selectors) from CSS3.

Acceptable queries
---------------

    // basic
    #foo // id
    .bar // class
    #foo a // descendents
    #foo a.bar element attribute comibination

    // attributes
    #foo a[href] // simple
    #foo a[href=bar] // attribute values
    #foo a[href^=http://] // attribute starts with
    #foo a[href$=com] // attribute ends with
    #foo a[href*=twitter] // attribute wildcards

    // combos
    div,p

    // variations
    #foo.bar.baz
    div#baz.thunk a[-data-info*="hello world"] strong
    #thunk[title$='huzza']

Contexts
-------
Each query can optionally pass in a context

    qwery('div', node); // existing DOM node or...
    qwery('div', '#foo'); // another query

Browser Support
---------------
  - IE6, IE7, IE8, IE9
  - Chrome 1 - 10
  - Safari 3, 4, 5
  - Firefox 2, 3, 4

Build
-----
Qwery uses [JSHint](http://www.jshint.com/) to keep some house rules as well as [UglifyJS](https://github.com/mishoo/UglifyJS) for its compression. For those interested in building Qwery yourself. Run *make* in the root of the project.

Tests
-----
point your browser at _qwery/tests/index.html_

Note
----
Qwery uses querySelectorAll when available. All querySelectorAll default behavior then applies.

Contributors
-------
  * [Dustin Diaz](https://github.com/ded/qwery/commits/master?author=ded)
  * [Jacob Thornton](https://github.com/ded/qwery/commits/master?author=fat)
