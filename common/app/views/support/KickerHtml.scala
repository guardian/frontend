package views.support

import play.twirl.api.{HtmlFormat, Html}

/** Because I've given up on whitespace reduction in Play templates */
object KickerHtml {
  def trimAndAppend(left: Html, right: Html): Html = {
    HtmlFormat.raw(left.body.trim + right.body.trim)
  }

  def trimAndAppendWithSpace(left: Html, right: Html): Html = {
    HtmlFormat.raw(List(left.body.trim, right.body.trim).filter(_.nonEmpty).mkString(" "))
  }

  def trim(html: Html): Html = {
    HtmlFormat.raw(html.body.trim)
  }
}
