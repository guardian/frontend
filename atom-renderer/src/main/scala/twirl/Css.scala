package com.gu.contentatom.renderer
package twirl

import play.twirl.api.{BufferedContent, Format, Formats}
// import play.api.http.ContentTypeOf
import scala.collection.immutable

/**
 * Type used in default CSS templates.
 */
class Css private (elements: immutable.Seq[Css], text: String) extends BufferedContent[Css](elements, text) {
  def this(text: String) = this(Nil, Formats.safe(text))
  def this(elements: immutable.Seq[Css]) = this(elements, "")

  // implicit def contentTypeHttp(implicit codec: Codec): ContentTypeOf[Http] =
  //   ContentTypeOf[Http](Some(ContentTypes.HTTP))

  /**
   * Content type of CSS
   */
  val contentType = "text/css"
}

/**
 * Helper for CSS utility methods.
 */
object Css {
  /**
   * Creates a CSS fragment with initial content specified
   */
  def apply(text: String) = {
    new Css(text)
  }
}

/**
 * Formatter for JavaScript content.
 */
object CssFormat extends Format[Css] {
  /**
   * Integrate `text` without performing any escaping process.
   * @param text Text to integrate
   */
  def raw(text: String): Css = Css(text)

  /**
   * Escapes `text` using CSS String rules.
   * @param text Text to integrate
   */
  def escape(text: String): Css = Css(escapeCss(text))

  /**
   * Generate an empty JavaScript fragment
   */
  val empty: Css = new Css("")

  /**
   * Create an JavaScript Fragment that holds other fragments.
   */
  def fill(elements: immutable.Seq[Css]): Css = new Css(elements)

  private def escapeCss(input: String): String = {
    val s = new StringBuilder()
    val len = input.length
    var pos = 0
    while (pos < len) {
      input.charAt(pos) match {
        // Standard Lookup
        case '\'' => s.append("\\'")
        case '\"' => s.append("\\\"")
        case '\\' => s.append("\\\\")
        case '/' => s.append("\\/")
        // if it not matches any characters above, just append it
        case c => s.append(c)
      }
      pos += 1
    }

    s.toString()
  }


}
