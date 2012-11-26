Bonzo
-----
a simple, to the point, hassle-free, small (1.4k), library agnostic, extensible DOM utility. Nothing else.
Bonzo is designed to live in any host library, or simply as a stand-alone tool for the majority of your DOM-related tasks.

<h3>It looks like this</h3>

    bonzo(elements)
      .hide()
      .addClass('foo')
      .append('<p>the happs</p>')
      .css({
        color: 'red',
        'background-color': 'white'
      })
      .show()

Paired with a Selector Engine
-----------------------------
A great way to use Bonzo is with a selector engine (like [Qwery](https://github.com/ded/qwery) for example). You could wrap bonzo up and augment your wrapper to inherit the same methods. That looks like this:

    function $(selector) {
      return bonzo(qwery(selector));
    }

    bonzo.augment(bonzo, $);

This now allows you to write the following code:

    $('#content a[rel~="bookmark"]').after('√').css('text-decoration', 'none');

Bonzo Extension API
-------------------
One of the greatest parts about Bonzo is its simplicity to hook into the internal chain to create custom methods. For example you can create a method called **color** like this:

    bonzo.augment({
      color: function (c) {
        this.css('color', c);
      }
    });

    // you can now do the following
    $('p').color('aqua');

All other API methods
---------------------

  * each
  * map
  * html
    - html() get
    - html(str) set
  * addClass
  * removeClass
  * hasClass
  * show
  * hide
  * append
  * prepend
  * before
  * after
  * css
    - css(prop, val)
    - css({properties})
  * offset
  * attr
    - attr(k) get
    - attr(k, v) set
  * remove
  * empty
  * detach
  * bonzo.augment
  * bonzo.doc[width|height]
  * bonzo.viewport[width|height]
  * bonzo.contains
  * bonzo.noConflict

The name Bonzo
--------------
Bonzo Madrid was a malicious battle school commander of whom eventually is killed by [Ender Wiggin](http://en.wikipedia.org/wiki/Ender_Wiggin). Bonzo represents the DOM, of whom we'd all love to slay.

Building
--------
Aside from simply downloading the source, if you would like to contribute, building Bonzo requires GNU 'make' and Node >= 0.4, and of course, git. The rest is easy:

    git clone git://github.com/ded/bonzo.git
    cd bonzo
    git submodule update --init
    make

*make* will run the [JSHint](http://jshint.com) linter as well as the [Uglify](https://github.com/mishoo/UglifyJS) compliler.

Tests
-----

    open bonzo/tests/tests.html

Contributors
-----

  * [Dustin Diaz](https://github.com/ded/bonzo/commits/master?author=ded)
  * [Jacob Thornton](https://github.com/ded/bonzo/commits/master?author=fat)