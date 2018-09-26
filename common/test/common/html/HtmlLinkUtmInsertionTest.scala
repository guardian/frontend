package common.html

import org.jsoup.Jsoup
import org.scalatest.{FlatSpec, Matchers}
import play.twirl.api.Html

class HtmlLinkUtmInsertionTest extends FlatSpec with Matchers {

  "HtmlLinkUtimInsertion" should "insert utm code place holders into an HTML string" in {
    val rawHtml =
      """
        |<!DOCTYPE html>
        |<html>
        |<head></head>
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
        |    <a href="https://www.theguardian.com/environment/2018/sep/26/dont-post-crisp-packets-royal-mail-begs-packaging-protesters">article link</a>
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
        |    <td>in the house <a href="https://www.theguardian.com/another/link?param">some other link</a></td>
        |  </tr>
        |</table>
        |
        |<hr>
        |
        |</body>
        |</html>""".stripMargin

    val expectedText =
      """
        |<!DOCTYPE html>
        |<html>
        |<head></head>
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
        |<a href="/link/?##braze_utm##">some link</a>
        |
        |<table>
        |  <tr>
        |    <a href="https://www.theguardian.com/environment/2018/sep/26/dont-post-crisp-packets-royal-mail-begs-packaging-protesters?##braze_utm##">article link</a>
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
        |    <td>in the house <a href="https://www.theguardian.com/another/link?param&##braze_utm##">some other link</a></td>
        |  </tr>
        |</table>
        |
        |<hr>
        |
        |</body>
        |</html>""".stripMargin

    HtmlLinkUtmInsertion(Html(rawHtml)) shouldBe Html(Jsoup.parse(expectedText).toString)
  }

}
