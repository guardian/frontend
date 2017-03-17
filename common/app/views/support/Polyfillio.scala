package views.support

object Polyfillio {
  /*
    when changing these options, be sure to update
    static/vendor/javascripts/polyfillio.fallback.js

    it's loaded as the fallback in the event this URL fails

    you can just browse to the same url defined below,
    but grab the non-minifed version of the response,
    with these additional params:
    &ua=qwerty&unknown=polyfill

    this will give us a full fat version containing everything, but gated,
    so that it will actually patch what is needs to.

    downside is the file size.
  */
  val url: String = "https://polyfill.guim.co.uk/v2/polyfill.min.js?" +
    "features=es6,es7,default-3.6" +
    "&flags=gated" +
    "&callback=guardianPolyfilled"
}
