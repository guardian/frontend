package pagepresser

import org.jsoup.Jsoup
import org.scalatest.{Matchers, FlatSpec}
import test.SingleServerSuite

import scala.io.Source


class HtmlCleanerTest extends FlatSpec with Matchers with SingleServerSuite {


  "HtmlCleaner" should "remove ad slots from a page that will be pressed" in {
    val originalSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2PageWithAdSlots.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString) //???

    val expectedCleanedDocFromSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2PageWithoutAdSlots.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = HtmlCleaner.removeAds(originalDoc)

    actualResult.html().replace(" ","") should be(expectedDoc.html().replace(" ",""))


  }

}
