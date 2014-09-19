package test

import java.net.URI

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import scala.collection.JavaConversions._

@DoNotDiscover class SectionTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render front title" in goTo("/uk-news") { browser =>
    browser.$(".container__meta__title").first.getText should be ("UK news")
  }

  it should "add alternate pages to editionalised sections for /uk/culture" in goTo("/uk/culture") { browser =>
    import browser._

    val alternateLinks = $("link[rel='alternate']").filterNot(_.getAttribute("type") == "application/rss+xml")
    alternateLinks.size should be (2)
    alternateLinks.exists(link => toPath(link.getAttribute("href")) == "/us/culture" && link.getAttribute("hreflang") == "en-us") should be (true)
    alternateLinks.exists(link => toPath(link.getAttribute("href")) == "/au/culture" && link.getAttribute("hreflang") == "en-au") should be (true)

  }

  it should "add alternate pages to editionalised sections for /au/culture" in goTo("/au/culture") { browser =>
    import browser._

    val alternateLinks = $("link[rel='alternate']").filterNot(_.getAttribute("type") == "application/rss+xml")
    alternateLinks.size should be (2)
    alternateLinks.exists(link => toPath(link.getAttribute("href")) == "/us/culture" && link.getAttribute("hreflang") == "en-us") should be (true)
    alternateLinks.exists(link => toPath(link.getAttribute("href")) == "/uk/culture" && link.getAttribute("hreflang") == "en-gb") should be (true)
  }

  it should "not add alternate pages to non editionalised sections" in goTo("/books") { browser =>
    import browser._

    val alternateLinks = $("link[rel='alternate']").filterNot(_.getAttribute("type") == "application/rss+xml")
    alternateLinks should be (empty)
  }

  private def toPath(url: String) = new URI(url).getPath
}
