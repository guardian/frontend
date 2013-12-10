Bonzo
-----

A library agnostic extensible DOM utility. Nothing else.

Bonzo is designed to live in any host library, such as [Ender](http://ender.jit.su), or simply as a stand-alone tool for the majority of your DOM-related tasks.

**It looks like this:**

``` js
bonzo(elements)
  .hide()
  .addClass('foo')
  .append('<p>the happs</p>')
  .css({
    color: 'red',
    'background-color': 'white'
  })
  .show()
```

--------------------------------------------------------

  * <a href="#useselector"><b>Use with a selector engine</b></a>
  * <a href="#extensions"><b>Bonzo extension API</b></a>
  * <a href="#api"><b>Complete Bonzo API</b></a>
  * <a href="#aboutname"><b>About the name "Bonzo"</b></a>
  * Contributing:
    - <a href="#building"><b>Building</b></a>
    - <a href="#tests"><b>Tests</b></a>
  * <a href="#browsers"><b>Browser support</b></a>
  * <a href="#ender"><b>Ender integration</b></a>
  * <a href="#contributors"><b>Contributors</b></a>
  * <a href="#licence"><b>Licence & copyright</b></a>

--------------------------------------------------------

<a name="useselector"></a>
Use with a selector engine
-----------------------------

A great way to use Bonzo is with a selector engine, like [Qwery](https://github.com/ded/qwery). You could wrap Bonzo up and augment your wrapper to inherit the same methods:

``` js
function $(selector) {
  return bonzo(qwery(selector));
}
```

This now allows you to write the following code:

``` js
$('#content a[rel~="bookmark"]').after('√').css('text-decoration', 'none');
```

<a name="extensions"></a>
Bonzo extension API
-------------------

One of the greatest parts about Bonzo is its simplicity to hook into the internal chain to create custom methods. For example you can create a method called `color()` like this:

``` js
bonzo.aug({
  color: function (c) {
    return this.css('color', c);
  }
})

// you can now do the following
$('p').color('aqua')
```

<a name="api"></a>
Complete Bonzo API
------------------

  * each(callback)
    - callback (element, index)
  * map(callback, reject)
    - callback (element, index)
    - reject (element)
  * html
    - html() get
    - html(str) set
  * text
    - text() get
    - text(str) set
  * addClass(c)
  * removeClass(c)
  * hasClass(c)
  * toggleClass(c)
  * show()
  * hide()
  * first()
  * last()
  * focus()
  * blur()
  * next()
  * previous()
  * parent()
  * append(html || node)
  * appendTo(target || selector)
  * prepend(html || node)
  * prependTo(target || selector)
  * before(html || node)
  * insertBefore(target || selector)
  * after(html || node)
  * insertAfter(target || selector)
  * replaceWith(html || node)
  * clone()
  * css()
    - css(prop) get
    - css(prop, val) set
    - css({properties}) set
  * offset()
    - offset(x, y) set
    - offset() get
      - top
      - left
      - width
      - height
  * dim()
    - width
    - height
  * attr
    - attr(k) get
    - attr(k, v) set
    - attr(obj) set
  * removeAttr(k)
  * val
    - val() get
    - val(s) set
  * data
    - data() get all
    - data(k) get
    - data(k, v) set
  * remove()
  * empty()
  * detach()
  * scrollLeft
    - scrollLeft() get
    - scrollLeft(x) set
  * scrollTop
    - scrollTop() get
    - scrollTop(y) set
  * bonzo.aug({ properties })
  * bonzo.doc()
    - width
    - height
  * bonzo.viewport()
    - width
    - height
  * bonzo.isAncestor(container, child)
  * bonzo.noConflict

Added in the Ender bridge

  * parents(selector)
  * closest(selector)
  * siblings()
  * children()
  * width()
  * height()


### Setting a query engine host

For the insertion methods you can set a query selector host:

``` js
bonzo.setQueryEngine(qwery)
bonzo(bonzo.create('<div>')).insertAfter('.boosh a')
```

<a name="aboutname"></a>
About the name "Bonzo"
----------------------
*Bonzo Madrid* was a malicious battle school commander of whom eventually is killed by [Ender Wiggin](http://en.wikipedia.org/wiki/Ender_Wiggin). Bonzo represents the DOM, of whom we'd all love to slay.

<a name="contributing"></a>
Contributing
------------

You should only edit the files in the *src/* directory. Bonzo is compiled into the *bonzo.js* and *bonzo.min.js* files contained in the root directory by the build command:

<a name="building"></a>
### Building

```sh
$ npm install
$ make
```

<a name="tests"></a>
### Tests

Point your test browser(s) to *tests/tests.html*, or:

```sh
$ open tests/tests.html
```

Please try to include tests or adjustments to existing tests with all non-trivial contributions.

<a name="browsers"></a>
Browser support
---------------

  * IE6+
  * Chrome
  * Safari 4+
  * Firefox 3.5+
  * Opera

<a name="ender"></a>
Ender integration
-----------------

Bonzo is a registered npm package and fits in nicely with the [Ender](http://ender.no.de) framework. If you don't have Ender, you should install now, and never look back, *ever*. As a side note the *query engine host* is set for you when you include it with Ender.

```sh
$ npm install ender -g
```

To combine Bonzo to your Ender build, you can add it as such:

```sh
$ ender build bonzo[ package-b[ package-c ...]]
```

or, add it to your existing ender package

```sh
$ ender add bonzo
```

Bonzo is included in [The Jeesh](http://ender.jit.su/#jeesh), Ender's "starter-pack", when you `ender build jeesh` you'll get Bonzo and some other amazing libraries that'll make working in the browser a breeze. See the [Ender documentation](http://ender.jit.su/) for more details.

<a name="contributors"></a>
Contributors
------------

  * [Dustin Diaz](https://github.com/ded/bonzo/commits/master?author=ded)
  * [Rod Vagg](https://github.com/ded/bonzo/commits/master?author=rvagg)
  * [Jacob Thornton](https://github.com/ded/bonzo/commits/master?author=fat)

<a name="licence"></a>
Licence & copyright
-------------------

Bonzo is Copyright &copy; 2012 Dustin Diaz [@ded](https://twitter.com/ded) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.