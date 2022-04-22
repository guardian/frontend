package html

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.twirl.api.Html

class BrazeEmailFormatterTest extends AnyFlatSpec with Matchers {

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
        |<a href="https://www.theguardian.com/environment/2018/sep/26/dont-post-crisp-packets-royal-mail-begs-packaging-protesters">article link</a>
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
        |    <td>in the house <a href="https://www.theguardian.com/another/link?param">some other link</a></td>
        |  </tr>
        |</table>
        |
        |<hr>
        |
        |</body>
        |</html>""".stripMargin

    val expectedText =
      """<!doctype html>
        |<html>
        |<head></head>
        |<body>
        |<h2>Heading text</h2>
        |<p>Paragraph.</p>
        |<br>
        |<div>
        |<span>My name is:</span> Bill
        |</div>
        |<a href="/link/?##braze_utm##">some link</a>
        |<a href="https://www.theguardian.com/environment/2018/sep/26/dont-post-crisp-packets-royal-mail-begs-packaging-protesters?##braze_utm##">article link</a>
        |<table>
        |<tbody>
        |<tr>
        |<td>The brown</td>
        |<td>fox jumped</td>
        |<td>over</td>
        |</tr>
        |<tr>
        |<td>a</td>
        |<td>cat on</td>
        |<td>the window</td>
        |</tr>
        |<tr>
        |<td>next to the</td>
        |<td>kitchen</td>
        |<td>in the house <a href="https://www.theguardian.com/another/link?param&amp;##braze_utm##">some other link</a></td>
        |</tr>
        |</tbody>
        |</table>
        |<hr>
        |</body>
        |</html>""".stripMargin

    BrazeEmailFormatter(Html(rawHtml)) shouldBe Html(expectedText)
  }

  it should "not affect unsubscribe url placeholder links" in {
    val rawHtml =
      """
        |<!DOCTYPE html>
        |<html>
        |<head></head>
        |<body>
        |
        |<a href="%%unsub_center_url%%">unsubscribe</a>
        |
        |</body>
        |</html>""".stripMargin

    val expectedText =
      """<!doctype html>
        |<html>
        |<head></head>
        |<body>
        |<a href="%%unsub_center_url%%">unsubscribe</a>
        |</body>
        |</html>""".stripMargin

    BrazeEmailFormatter(Html(rawHtml)) shouldBe Html(expectedText)
  }

}
