package common

import org.jsoup.Jsoup
import org.scalatest.{FlatSpec, Matchers}

import pagepresser.{InteractiveImmersiveHtmlCleaner}

class HtmlCleanerTest extends FlatSpec with Matchers {

  "InteractiveImmersiveHtmlCleaner" should "only clean interactive immersives" in {
    val doc = Jsoup.parse("""<html>
              |<head>
              |<link rel="canonical" href="https://www.theguardian.com/world/ng-interactive/2020/apr/08/coronavirus-100">
              |</head>
              |<body class="is-immersive is-immersive-interactive"></body>
              |</html>""")

    InteractiveImmersiveHtmlCleaner.canClean(doc) should be(true)
  }

 "Cleaned interactive immersives" should "have top banner ads removed" in {
    val doc = Jsoup.parse("""<html>
              |<body>
              |<div id="bannerandheader">
              |<div class="top-banner-ad-container js-top-banner"></div>
              |<header></header>
              |</div>
              |</body>
              |</html>""".stripMargin)

    val want = Jsoup.parse("""<html>
               |<body>
               |<div id="bannerandheader">
               |<header></header>
               |</div>
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

    val want = Jsoup.parse("""<html>
               |<body>
               |<div id="bannerandheader">
               |<header>
               |<nav>
               |</nav>
               |</header>
               |</div>
               |</body>
               |</html>""".stripMargin).toString

    InteractiveImmersiveHtmlCleaner.clean(doc, true).toString should equal(want)
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

    val want = Jsoup.parse("""<html>
              |<body>
              |<footer>
              |<div class="l-footer__secondary js-footer__secondary">
              |<div class="colophon__lists-container">
              |<ul class="colophon__list"></ul>
              |<div class="colophon__list">
              |</div>
              |</div>
              |</div>
              |</footer>
              |</body>
              |</html>""".stripMargin).toString

    InteractiveImmersiveHtmlCleaner.clean(doc, true).toString should equal(want)
  }

  it should "have '(pressed)' appended to the copyright" in {
    val doc = Jsoup.parse("""<html>
              |<body>
              |<footer>
              |<div class="copyright-container">
              |<div class="really-serious-copyright">
              |All rights reserved.</div>
              |</div>
              |</footer>
              |</body>
              |</html>""".stripMargin)

    val want = Jsoup.parse("""<html>
              |<body>
              |<footer>
              |<div class="copyright-container">
              |<div class="really-serious-copyright">
              |All rights reserved. (pressed)</div>
              |</div>
              |</footer>
              |</body>
              |</html>""".stripMargin).toString

    InteractiveImmersiveHtmlCleaner.clean(doc, true).toString should equal(want)
  }

}
