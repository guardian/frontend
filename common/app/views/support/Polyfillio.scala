package views.support

object Polyfillio {
  /*
    when changing these options, be sure to update
    static/vendor/javascripts/polyfillio.fallback.js
    with the non-minifed version of the reponse,
    but requested with:
    &ua=qwerty&unknown=polyfill

    it's loaded as the fallback in the event this URL fails
  */
  val url: String = "https://polyfill.guim.co.uk/v2/polyfill.min.js?" +
    "features=es6,es7,default-3.6" +
    "&flags=gated" +
    "&callback=guardianPolyfilled"
}
