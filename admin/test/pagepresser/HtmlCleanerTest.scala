package pagepresser

import org.jsoup.Jsoup
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.ConfiguredTestSuite
import scala.io.Source

@DoNotDiscover class HtmlCleanerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "HtmlCleaner" should "remove ad slots from a page that will be pressed" in {
    val originalSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithAdSlots.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithAdSlotsRemoved.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = HtmlCleaner.removeAds(originalDoc)

    actualResult.html().replace(" ","") should be(expectedDoc.html().replace(" ",""))
  }

  it should "remove Google custom search" in {
    val originalSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithGoogleSearchBox.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithGoogleSearchBoxRemoved.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = HtmlCleaner.removeGoogleSearchBox(originalDoc)

    actualResult.html().replace(" ","") should be(expectedDoc.html().replace(" ",""))
  }

  it should "remove share links" in {
    val originalSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithShareLinks.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithShareLinksRemoved.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = HtmlCleaner.removeShareLinks(originalDoc)

    actualResult.html().replace(" ","") should be(expectedDoc.html().replace(" ",""))
  }

  it should "remove related links component" in {
    val originalSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithRelatedComponent.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithRelatedComponentRemoved.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = HtmlCleaner.removeRelatedComponent(originalDoc)

    actualResult.html().replace(" ","") should be(expectedDoc.html().replace(" ",""))
  }
}
