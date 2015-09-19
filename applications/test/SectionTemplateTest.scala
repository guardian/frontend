package test

import java.net.URI

import org.fluentlenium.core.domain.FluentWebElement
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.TestBrowser

import scala.collection.JavaConversions._

@DoNotDiscover class SectionTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render front title" in goTo("/uk-news") { browser =>
    browser.$("[data-test-id=header-title]").first.getText should be ("UK news")
  }

  it should "add alternate pages to editionalised sections for /uk/culture" in goTo("/uk/culture") { browser =>

    val alternateLinks = getAlternateLinks(browser)
    alternateLinks.size should be (2)
    alternateLinks.exists(link => toPath(link.getAttribute("href")) == "/us/culture" && link.getAttribute("hreflang") == "en-US") should be (true)
    alternateLinks.exists(link => toPath(link.getAttribute("href")) == "/au/culture" && link.getAttribute("hreflang") == "en-AU") should be (true)

  }

  def getAlternateLinks(browser: TestBrowser): Seq[FluentWebElement] = {
    import browser._
    $("link[rel='alternate']").toList
      .filterNot(_.getAttribute("type") == "application/rss+xml")
      .filter(element => Option(element.getAttribute("href")).isDefined) // ios-app: urls return null for some bizarre reason
  }

  it should "add alternate pages to editionalised sections for /au/culture" in goTo("/au/culture") { browser =>

    val alternateLinks = getAlternateLinks(browser)
    alternateLinks.size should be (2)
    alternateLinks.exists(link => toPath(link.getAttribute("href")) == "/us/culture" && link.getAttribute("hreflang") == "en-US") should be (true)
    alternateLinks.exists(link => toPath(link.getAttribute("href")) == "/uk/culture" && link.getAttribute("hreflang") == "en-GB") should be (true)
  }

  it should "not add alternate pages to non editionalised sections" in goTo("/books") { browser =>

    val alternateLinks = getAlternateLinks(browser)
    alternateLinks should be (empty)
  }

  it should "not add alternate pages to 'all' pages for a section" in goTo("/business/1929/oct/24/all") { browser =>

    val alternateLinks = getAlternateLinks(browser)
    alternateLinks should be (empty)
  }

  private def toPath(url: String) = new URI(url).getPath
}
