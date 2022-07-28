package pagepresser

import org.jsoup.Jsoup
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import test.ConfiguredTestSuite

import scala.io.Source

@DoNotDiscover class HtmlCleanerTest extends AnyFlatSpec with Matchers with ConfiguredTestSuite {

  "BasicHtmlCleaner" should "remove ad slots from a page that will be pressed" in {
    val originalSource =
      Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithAdSlots.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource =
      Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithAdSlotsRemoved.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = SimpleHtmlCleaner.removeAds(originalDoc)

    actualResult.html().replace(" ", "") should be(expectedDoc.html().replace(" ", ""))
  }

  // This removes the byline from datablog, I'm leaving this commented as it
  // could be needed for some content- and represents the state of the pressed archive.
  // it should "remove related links component" in {
  //   val originalSource = Source.fromInputStream(
  //     getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithRelatedComponent.html"),
  //   )
  //   val originalDoc = Jsoup.parse(originalSource.mkString)

  //   val expectedCleanedDocFromSource = Source.fromInputStream(
  //     getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithRelatedComponentRemoved.html"),
  //   )
  //   val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

  //   val actualResult = SimpleHtmlCleaner.removeRelatedComponent(originalDoc)

  //   actualResult.html().replace(" ", "") should be(expectedDoc.html().replace(" ", ""))
  // }

  it should "change links to protocol relative urls to satisfy http and https requests" in {
    val html =
      "<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"http://static.guim.co.uk/static/6d5811c93d9b815024b5a6c3ec93a54be18e52f0/common/styles/print.css\" media=\"print\" class=\"contrast\"/><meta property=\"og:url\" content=\"http://www.theguardian.com/info/developer-blog/2012/oct/30/miso-dataset-new-release-features\"/>\n\t</head><body> some text <img src=\"http://static.guim.co.uk/static/6d5811c93d9b815024b5a6c3ec93a54be18e52f0/common/images/logos/the-guardian/info.gif\" width=\"115\" height=\"22\" alt=\"The Guardian home\" /></body></html>"
    val expectedDoc = Jsoup.parse(
      "<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"//static.guim.co.uk/static/6d5811c93d9b815024b5a6c3ec93a54be18e52f0/common/styles/print.css\" media=\"print\" class=\"contrast\"/><meta property=\"og:url\" content=\"http://www.theguardian.com/info/developer-blog/2012/oct/30/miso-dataset-new-release-features\"/>\n\t</head><body> some text <img src=\"//static.guim.co.uk/static/6d5811c93d9b815024b5a6c3ec93a54be18e52f0/common/images/logos/the-guardian/info.gif\" width=\"115\" height=\"22\" alt=\"The Guardian home\" /></body></html>",
    )

    val actualResult = SimpleHtmlCleaner.replaceLinks(Jsoup.parse(html))
    actualResult.html().replace(" ", "") should be(expectedDoc.html().replace(" ", ""))

  }
}
