package pagepresser

import org.jsoup.Jsoup
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.{SingleServerSuite, ConfiguredTestSuite}
import scala.io.Source

class HtmlCleanerTest extends FlatSpec with Matchers with SingleServerSuite {

  "BasicHtmlCleaner" should "remove ad slots from a page that will be pressed" in {
    val originalSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithAdSlots.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithAdSlotsRemoved.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = BasicHtmlCleaner.removeAds(originalDoc)

    actualResult.html().replace(" ","") should be(expectedDoc.html().replace(" ",""))
  }


  it should "remove related links component" in {
    val originalSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithRelatedComponent.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithRelatedComponentRemoved.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = BasicHtmlCleaner.removeRelatedComponent(originalDoc)

    actualResult.html().replace(" ","") should be(expectedDoc.html().replace(" ",""))
  }

  it should "get the omniture parameters for the simple page tracking" in {
    val html = "<html><head></head><body><noscript id=\"omnitureNoScript\">\n <div><img alt=\"\" src='http://hits.theguardian.com/b/ss/guardiangu-network/1/H.25.7/37802?ns=guardian&pageName=Culture%3AMusic%3AWomad+2013%3ACompetition%3Awin-womad-tickets%3A1918994&ch=Music&c3=GU.co.uk&c4=Womad+2013%2CMusic+festivals&c5=Festivals&c6=&c7=2013%2F06%2F08+12%3A05&c8=1918994&c9=Competition&c10=&c13=&c19=GUK&c47=UK&c64=UK&c65=Win+one+of+50+pairs+of+tickets+to+WOMAD&c66=Culture&c67=nextgen-non-compatible&c72=Culture%3AMusic%3AWomad+2013&c73=Culture%3AMusic%3AWomad+2013&c74=Culture%3AMusic&c75=Culture&h2=GU%2FCulture%2FMusic%2FWomad+2013&c2=GUID:(none)' width=\"1\" height=\"1\" /></div>\n</noscript></body>"

    BasicHtmlCleaner.fetchOmnitureTags(Jsoup.parse(html)) should be ("ns=guardian&ndh=1&c19=GUK&AQE=1&ch=Music&ce=UTF-8&AQB=1&cpd=2&v9=D=g&pageName=Culture:Music:Womad+2013:Competition:win-womad-tickets:1918994&v14=D=r")
  }

  it should "add the basic omniture tag" in {
    val html = "<html><head></head><body> some text </body></html>"
    val expectedDoc = Jsoup.parse("<html><head></head><body> some text <!---Omniture page tracking for pressed page ---> <img src=\"https://hits-secure.theguardian.com/b/ss/guardiangu-network/1/JS-1.4.1/s985205503180623100?ns=guardian&ndh=1&c19=GUK&AQE=1&ch=Music&ce=UTF-8&AQB=1&cpd=2&v9=D=g&pageName=Culture:Music:Womad+2013:Competition:win-womad-tickets:1918994&v14=D=r\" width=\"1\" height=\"1\"/></body></html>")

    val actualResult = HtmlCleaner.createSimplePageTracking(Jsoup.parse(html), "ns=guardian&ndh=1&c19=GUK&AQE=1&ch=Music&ce=UTF-8&AQB=1&cpd=2&v9=D=g&pageName=Culture:Music:Womad+2013:Competition:win-womad-tickets:1918994&v14=D=r")
    actualResult.html().replace(" ", "") should be(expectedDoc.html().replace(" ", ""))
  }

}
