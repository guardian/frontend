package common

import java.text.Normalizer

object StringEncodings {
  def asAscii(s: String): String =
    Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("[^\\p{ASCII}]", "")

  /**
    * unicode CR and LF are valid in JSON but not in JS, so we need to run our JSON through
    * this before embedding it into JS files.
    * https://code.google.com/p/v8/issues/detail?id=1907
    *
   * @param json the original json source
    * @return the JS
    */
  def jsonToJS(json: String): String =
    json
      .replaceAll("\u2028", """\\u2028""")
      .replaceAll("\u2029", """\\u2029""")
}
