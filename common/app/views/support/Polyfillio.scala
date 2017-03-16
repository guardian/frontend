package views.support

object Polyfillio {
  /*
    when changing these options, be sure to update
    static/vendor/javascripts/polyfillio.response.js
    with the non-minifed version of the reponse, as
    requested by IE9 – or whatever is your baseline now ;)

    it's loaded as the fallback in the event this URL fails
  */
  val url: String = "https://polyfill.guim.co.uk/v2/polyfill.min.js?" +
    "features=es6,es7,default|gated" +
    "&callback=polyfilled"
}
