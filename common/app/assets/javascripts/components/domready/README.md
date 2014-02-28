## domReady

It's easy. Works like this:

``` js
domready(function () {
  // dom is loaded!
})
```

### Browser support

  * IE9+
  * Firefox 4+
  * Safari 3+
  * Chrome *
  * Opera *

### Building

``` sh
npm install
make
open tests/test.html
```

### Including with Ender

Don't already have [Ender](http://enderjs.com)? Install it like this:

``` sh
npm install ender -g
```

Include domready in your package:

``` sh
ender add domready
```

Then use it like this

``` js
require('domready')(function () {
  $('body').html('<p>boosh</p>')
})

// or

$(document).ready(function () {
  $('body').html('<p>boosh</p>')
})
```
