package frontend.common

import play.api.templates.Html
import org.apache.commons.lang.StringEscapeUtils._

object JavaScriptString {
  //we wrap the result in an Html so that play does not escape it as html
  //after we have gone to the trouble of escaping it as Javascript
  def apply(string: String): Html = Html(escapeJavaScript(string))
}
