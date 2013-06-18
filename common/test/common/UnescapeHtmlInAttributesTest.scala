package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import views.support.{StripAndEscapeHtmlTags, HtmlCleaner}

class UnescapeHtmlInAttributesTest extends FlatSpec with ShouldMatchers {

  "Unescape HTML in attributes" should "remove strip HTML and unescape entities" in {



    val html: String = StripAndEscapeHtmlTags(
      "Wigan Athletic have appointed Owen Coyle, the former Burnley and Bolton manager, to succeed Roberto Mart&iacute;nez. Photograph: Carl Recine/Action Images")
    html should equal ("Wigan Athletic have appointed Owen Coyle, the former Burnley and Bolton manager, to succeed Roberto Martínez. Photograph: Carl Recine/Action Images")
  }



}
