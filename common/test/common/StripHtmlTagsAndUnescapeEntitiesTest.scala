package common

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import views.support.{StripHtmlTagsAndUnescapeEntities}

class StripHtmlTagsAndUnescapeEntitiesTest extends FlatSpec with Matchers {

  "Strip HTML tags and unescape entities" should "unescape entities" in {

    val html: String = StripHtmlTagsAndUnescapeEntities(
    "Wigan Athletic have appointed Owen Coyle, the former Burnley and Bolton manager, to succeed Roberto Mart&iacute;nez. Photograph: Carl Recine/Action Images")

    html should equal ("Wigan Athletic have appointed Owen Coyle, the former Burnley and Bolton manager, to succeed Roberto Martínez. Photograph: Carl Recine/Action Images")

  }

  it should "strip out HTML" in {
    val html: String = StripHtmlTagsAndUnescapeEntities(
    "<a href=\"https://www.facebook.com/pages/Jacob-Everett/295006103859003\">Jacob Everett </a> has a simple idea, but one that he carries out beautifully: the head of a famous person imposed on shoulders made from a map of the area they are associated with. This one of Groucho Marx and a map of New York from 1939 is available to buy at <a href=\"http://www.jacobeverett.com/\">jacobeverett.com</a>. Recommended by Guardian reader <a href=\"http://discussion.guardian.co.uk/comment-permalink/23575543\">Adamki</a>.")
    html should equal ("Jacob Everett  has a simple idea, but one that he carries out beautifully: the head of a famous person imposed on shoulders made from a map of the area they are associated with. This one of Groucho Marx and a map of New York from 1939 is available to buy at jacobeverett.com. Recommended by Guardian reader Adamki.")
  }

  it should "escape double quotes" in {
    val html: String = StripHtmlTagsAndUnescapeEntities("\"quoted text\"")
    html should equal ("&#34;quoted text&#34;")
  }



}
