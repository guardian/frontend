package html

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.twirl.api.Html

class HtmlTextExtractorTest extends AnyFlatSpec with Matchers {

  "HtmlTextExtractor" should "extract text from html" in {
    val rawHtml =
      """
        |<!DOCTYPE html>
        |<html>
        |<body>
        |
        |<h2>Heading text</h2>
        |
        |<p>Paragraph.</p>
        |<br/>
        |<div>
        |  <span>My name is:</span> Bill
        |</div>
        |
        |<a href="/link/">some link</a>
        |
        |<table>
        |  <tr>
        |    <td>The brown</td>
        |    <td>fox jumped</td>
        |    <td>over</td>
        |  </tr>
        |  <tr>
        |    <td>a</td>
        |    <td>cat on</td>
        |    <td>the window</td>
        |  </tr>
        |  <tr>
        |    <td>next to the</td>
        |    <td>kitchen</td>
        |    <td>in the house</td>
        |  </tr>
        |</table>
        |
        |<hr>
        |
        |</body>
        |</html>""".stripMargin

    val expectedText =
      """
        |Heading text
        |
        |Paragraph.
        |
        |My name is: Bill
        |https://www.theguardian.com/link/
        |some link
        |
        |The brown
        |fox jumped
        |over
        |
        |a
        |cat on
        |the window
        |
        |next to the
        |kitchen
        |in the house
        |""".stripMargin

    HtmlTextExtractor(Html(rawHtml)) shouldBe expectedText
  }

}
