package common

import org.jsoup.Jsoup
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDateTime
import pagepresser.InteractiveImmersiveHtmlCleaner

class InteractiveImmersiveHtmlCleanerTest extends AnyFlatSpec with Matchers {
  val now = LocalDateTime.parse("2021-08-26T10:15:30")

  "InteractiveImmersiveHtmlCleaner" should "only clean interactive immersives" in {
    val doc = Jsoup.parse(
      """<html>
              |<head>
              |<link rel="canonical" href="https://www.theguardian.com/world/ng-interactive/2020/apr/08/coronavirus-100">
              |</head>
              |<body class="is-immersive is-immersive-interactive"></body>
              |</html>""".stripMargin,
    )

    InteractiveImmersiveHtmlCleaner.canClean(doc) should be(true)
  }

  "Cleaned interactive immersives" should "set page config to hide reader revenue" in {
    val doc = Jsoup.parse("""<html>
              |<head>
              |</head>
              |<body>
              |</body>
              |</html>""".stripMargin)

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.hideReaderRevenue(doc)
    val cleanEl = cleanedDoc.getElementsByTag("script").first()
    cleanEl.text() should equal(
      "window.guardian.config.page.shouldHideReaderRevenue=true",
    )
  }

  it should "have reader revenue callouts in the header removed" in {
    val doc = Jsoup.parse("""<html>
              |<body>
              |<div id="bannerandheader">
              |<header>
              |<nav>
              |<div class="new-header__cta-bar"></div>
              |</nav>
              |</header>
              |</div>
              |</body>
              |</html>""".stripMargin)

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.removeHeaderCallout(doc)

    cleanedDoc.getElementsByClass("new-header__cta-bar").isEmpty should be(true)
  }

  it should "have reader revenue callouts in the footer removed" in {
    val doc = Jsoup.parse("""<html>
              |<body>
              |<footer>
              |<div class="l-footer__secondary js-footer__secondary">
              |<div class="colophon__lists-container">
              |<ul class="colophon__list"></ul>
              |<div class="colophon__list">
              |<div class="cta-bar__text" /></div>
              |<a class="cta-bar__cta js-acquisition-link" data-link-name="footer : contribute-cta"></a>
              |<a class="cta-bar__cta js-acquisition-link" data-link-name="footer : subscribe-cta"></a>
              |</div>
              |</div>
              |</footer>
              |</body>
              |</html>""".stripMargin)

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.removeFooterCallout(doc)

    cleanedDoc.getElementsByAttributeValue("data-link-name", "footer : contribute-cta").isEmpty should be(true)
    cleanedDoc.getElementsByAttributeValue("data-link-name", "footer : subscribe-cta").isEmpty should be(true)
    cleanedDoc.getElementsByClass("cta-bar__text").isEmpty should be(true)
  }

  it should "have additional styled copy appended at end of body" in {
    val doc = Jsoup.parse("""<html>
              |<head>
              |</head>
              |<body>
              |</body>
              |</html>""".stripMargin)

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.addExtraCopyToDocument(doc, now)

    cleanedDoc.getElementsByTag("body").first().text() should equal(
      "This article was archived on 26 August 2021. Some elements may be out of date.",
    )
    cleanedDoc.head().getElementsByTag("style").isEmpty() should be(false)
  }

  it should "have email signup removed" in {
    val doc = Jsoup.parse("""<html>
              |<body>
              |<footer>
              |<div class="footer__email-container">
              |</div>
              |</footer>
              |</body>
              |</html>""".stripMargin)

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.removeEmailSignup(doc)

    cleanedDoc.getElementsByClass("footer__email-container").isEmpty should be(true)
  }

}
