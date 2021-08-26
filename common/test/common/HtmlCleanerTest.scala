package common

import org.jsoup.Jsoup
import org.scalatest.{FlatSpec, Matchers}
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

import pagepresser.{InteractiveImmersiveHtmlCleaner}

class HtmlCleanerTest extends FlatSpec with Matchers {

  "InteractiveImmersiveHtmlCleaner" should "only clean interactive immersives" in {
    val doc = Jsoup.parse(
      """<html>
              |<head>
              |<link rel="canonical" href="https://www.theguardian.com/world/ng-interactive/2020/apr/08/coronavirus-100">
              |</head>
              |<body class="is-immersive is-immersive-interactive"></body>
              |</html>""",
    )

    InteractiveImmersiveHtmlCleaner.canClean(doc) should be(true)
  }

  "Cleaned interactive immersives" should "have top banner ads removed" in {
    val doc = Jsoup.parse("""<html>
              |<body>
              |<div id="bannerandheader">
              |<div class="top-banner-ad-container js-top-banner"></div>
              |</div>
              |</body>
              |</html>""".stripMargin)

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.clean(doc, true)
    cleanedDoc.getElementsByClass("top-banner-ad-container").isEmpty should be(true)
  }

  it should "set page config to hide reader revenue" in {
    val doc = Jsoup.parse("""<html>
              |<head>
              |</head>
              |<body>
              |</body>
              |</html>""".stripMargin)

    val want = Jsoup.parse("""<html>
               |<head>
               |<script>window.guardian.config.page.shouldHideReaderRevenue=true</script>
               |</head>
               |<body>
               |</body>
               |</html>""".stripMargin).toString

    InteractiveImmersiveHtmlCleaner.clean(doc, true).toString should equal(want)
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

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.clean(doc, true)

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

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.clean(doc, true)

    cleanedDoc.getElementsByAttributeValue("data-link-name", "footer : contribute-cta").isEmpty should be(true)
    cleanedDoc.getElementsByAttributeValue("data-link-name", "footer : subscribe-cta").isEmpty should be(true)
    cleanedDoc.getElementsByClass("cta-bar__text").isEmpty should be(true)
  }

  it should "have appended additional copy" in {
    val doc = Jsoup.parse("""<html>
              |<body>
              |<footer>
              |</footer>
              |</body>
              |</html>""".stripMargin)

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.clean(doc, true)
    val date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))

    cleanedDoc.getElementsByTag("body").first().text() should equal(
      s"This article was archived on ${date}. Some elements may be out of date.",
    )
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

    val cleanedDoc = InteractiveImmersiveHtmlCleaner.clean(doc, true)

    cleanedDoc.getElementsByClass("footer__email-container").isEmpty should be(true)
  }

}
