package layout

import play.twirl.api.Html

case class HtmlAndClasses(index: Int, html: Html, classes: Seq[String])
