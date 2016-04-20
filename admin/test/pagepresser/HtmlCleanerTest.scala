package pagepresser

import org.jsoup.Jsoup
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.{SingleServerSuite, ConfiguredTestSuite}
import scala.io.Source

@DoNotDiscover class HtmlCleanerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "BasicHtmlCleaner" should "remove ad slots from a page that will be pressed" in {
    val originalSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithAdSlots.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithAdSlotsRemoved.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = SimpleHtmlCleaner.removeAds(originalDoc)

    actualResult.html().replace(" ","") should be(expectedDoc.html().replace(" ",""))
  }


  it should "remove related links component" in {
    val originalSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithRelatedComponent.html"))
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("pagepresser/r2/pageWithRelatedComponentRemoved.html"))
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString)

    val actualResult = SimpleHtmlCleaner.removeRelatedComponent(originalDoc)

    actualResult.html().replace(" ","") should be(expectedDoc.html().replace(" ",""))
  }

  it should "get the omniture parameters for the simple page tracking" in {
    val html = "<html><head></head><body><noscript id=\"omnitureNoScript\">\n <div><img alt=\"\" src='http://hits.theguardian.com/b/ss/guardiangu-network/1/H.25.7/37802?ns=guardian&pageName=Life+%26+style%3AFeatures%3ACompetition%3Apollyjeans%3A1334360&ch=Life+and+style&c3=GU.co.uk&c4=Womad+2013%2CMusic+festivals&c5=Festivals&c6=&c7=2013%2F06%2F08+12%3A05&c8=1918994&c9=Competition&c10=&c13=&c19=GUK&c47=UK&c64=UK&c65=Win+one+of+50+pairs+of+tickets+to+WOMAD&c66=Culture&c67=nextgen-non-compatible&c72=Culture%3AMusic%3AWomad+2013&c73=Culture%3AMusic%3AWomad+2013&c74=Culture%3AMusic&c75=Culture&h2=GU%2FCulture%2FMusic%2FWomad+2013&c2=GUID:(none)' width=\"1\" height=\"1\" /></div>\n</noscript></body>"

    SimpleHtmlCleaner.fetchOmnitureTags(Jsoup.parse(html)) should be ("ns=guardian&ndh=1&c19=frontendarchive&AQE=1&ch=Life+and+style&ce=UTF-8&AQB=1&cpd=2&v9=D=g&pageName=Life+%26+style:Features:Competition:pollyjeans:1334360&v14=D=r")
  }

  it should "add the basic omniture tag" in {
    val html = "<html><head></head><body> some text <noscript id=\"omnitureNoScript\"><div><img alt=\"\" " +
      "src='http://hits.theguardian.com/b/ss/guardiangu-network/1/H.25.7/8091?" +
      "ns=guardian&pageName=Life+%26+style%3AFeatures%3ACompetition%3Apollyjeans%3A1334360&ch=Life+and+style&c3=Obs" +
      "&c4=Fashion&c5=Fashion+and+Beauty&c6=Polly+Vernon&c7=2010%2F01%2F17+12%3A15&c8=1334360&c9=Competition&c10=" +
      "&c13=&c19=GUK&c47=UK&c64=UK&c65=Win+a+pair+of+Polly+jeans+from+River+Island&c66=Life+and+style" +
      "&c67=nextgen-non-compatible&c72=Life+%26+style%3AFeatures&c73=Life+%26+style%3AFeatures" +
      "&c74=Life+%26+style%3AFeatures&c75=Life+%26+style&h2=GU%2FLife+and+style%2FLife+and+style%2F" +
      "&c2=GUID:(none)' width=\"1\" height=\"1\" /></div></noscript></body></html>"
    val expectedHtml = "<html><head></head><body> some text <noscript id=\"omnitureNoScript\"><div><img alt=\"\" " +
      "src='http://hits.theguardian.com/b/ss/guardiangu-network/1/H.25.7/8091?" +
      "ns=guardian&pageName=Life+%26+style%3AFeatures%3ACompetition%3Apollyjeans%3A1334360&ch=Life+and+style&c3=Obs" +
      "&c4=Fashion&c5=Fashion+and+Beauty&c6=Polly+Vernon&c7=2010%2F01%2F17+12%3A15&c8=1334360&c9=Competition&c10=" +
      "&c13=&c19=GUK&c47=UK&c64=UK&c65=Win+a+pair+of+Polly+jeans+from+River+Island&c66=Life+and+style" +
      "&c67=nextgen-non-compatible&c72=Life+%26+style%3AFeatures&c73=Life+%26+style%3AFeatures" +
      "&c74=Life+%26+style%3AFeatures&c75=Life+%26+style&h2=GU%2FLife+and+style%2FLife+and+style%2F" +
      "&c2=GUID:(none)' width=\"1\" height=\"1\" /></div></noscript>" +
      "<!---Omniture page tracking for pressed page ---> " +
      "<img src=\"https://hits-secure.theguardian.com/b/ss/guardiangu-network/1/JS-1.4.1/s985205503180623100?" +
      "ns=guardian&ndh=1&c19=frontendarchive&AQE=1&ch=Life+and+style&ce=UTF-8&AQB=1&cpd=2&v9=D=g" +
      "&pageName=Life+%26+style:Features:Competition:pollyjeans:1334360&v14=D=r\" width=\"1\" height=\"1\"/>" +
      "</body></html>"
    val expectedDoc = Jsoup.parse(expectedHtml)
    val actualResult = SimpleHtmlCleaner.createSimplePageTracking(Jsoup.parse(html))
    actualResult.html().replace(" ", "") should be(expectedDoc.html().replace(" ", ""))
  }

  it should "remove noscript tags" in {
    val html = "<html><head></head><body> some text <noscript id=\"omnitureNoScript\"><div><img alt=\"\" " +
      "src='http://hits.theguardian.com/b/ss/guardiangu-network/1/H.25.7/8091?" +
      "ns=guardian&pageName=Life+%26+style%3AFeatures%3ACompetition%3Apollyjeans%3A1334360&ch=Life+and+style&c3=Obs" +
      "&c4=Fashion&c5=Fashion+and+Beauty&c6=Polly+Vernon&c7=2010%2F01%2F17+12%3A15&c8=1334360&c9=Competition&c10=" +
      "&c13=&c19=GUK&c47=UK&c64=UK&c65=Win+a+pair+of+Polly+jeans+from+River+Island&c66=Life+and+style" +
      "&c67=nextgen-non-compatible&c72=Life+%26+style%3AFeatures&c73=Life+%26+style%3AFeatures" +
      "&c74=Life+%26+style%3AFeatures&c75=Life+%26+style&h2=GU%2FLife+and+style%2FLife+and+style%2F" +
      "&c2=GUID:(none)' width=\"1\" height=\"1\" /></div></noscript>" +
      "<!---Omniture page tracking for pressed page ---> " +
      "<img src=\"https://hits-secure.theguardian.com/b/ss/guardiangu-network/1/JS-1.4.1/s985205503180623100?" +
      "ns=guardian&ndh=1&c19=frontendarchive&AQE=1&ch=Life+and+style&ce=UTF-8&AQB=1&cpd=2&v9=D=g" +
      "&pageName=Life+%26+style:Features:Competition:pollyjeans:1334360&v14=D=r\" width=\"1\" height=\"1\"/>" +
      "</body></html>"
    val expectedHtml = "<html><head></head><body> some text" +
      "<!---Omniture page tracking for pressed page ---> " +
      "<img src=\"https://hits-secure.theguardian.com/b/ss/guardiangu-network/1/JS-1.4.1/s985205503180623100?" +
      "ns=guardian&ndh=1&c19=frontendarchive&AQE=1&ch=Life+and+style&ce=UTF-8&AQB=1&cpd=2&v9=D=g" +
      "&pageName=Life+%26+style:Features:Competition:pollyjeans:1334360&v14=D=r\" width=\"1\" height=\"1\"/>" +
      "</body></html>"
    val expectedDoc = Jsoup.parse(expectedHtml)
    val actualResult = SimpleHtmlCleaner.removeByTagName(Jsoup.parse(html), "noscript")
    actualResult.html().replace(" ", "") should be(expectedDoc.html().replace(" ", ""))
  }

  it should "change links to protocol relative urls to satisfy http and https requests" in {
    val html = "<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"http://static.guim.co.uk/static/6d5811c93d9b815024b5a6c3ec93a54be18e52f0/common/styles/print.css\" media=\"print\" class=\"contrast\"/><meta property=\"og:url\" content=\"http://www.theguardian.com/info/developer-blog/2012/oct/30/miso-dataset-new-release-features\"/>\n\t</head><body> some text <img src=\"http://static.guim.co.uk/static/6d5811c93d9b815024b5a6c3ec93a54be18e52f0/common/images/logos/the-guardian/info.gif\" width=\"115\" height=\"22\" alt=\"The Guardian home\" /></body></html>"
    val expectedDoc = Jsoup.parse("<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"//static.guim.co.uk/static/6d5811c93d9b815024b5a6c3ec93a54be18e52f0/common/styles/print.css\" media=\"print\" class=\"contrast\"/><meta property=\"og:url\" content=\"http://www.theguardian.com/info/developer-blog/2012/oct/30/miso-dataset-new-release-features\"/>\n\t</head><body> some text <img src=\"//static.guim.co.uk/static/6d5811c93d9b815024b5a6c3ec93a54be18e52f0/common/images/logos/the-guardian/info.gif\" width=\"115\" height=\"22\" alt=\"The Guardian home\" /></body></html>")

    val actualResult = SimpleHtmlCleaner.replaceLinks(Jsoup.parse(html))
    actualResult.html().replace(" ", "") should be(expectedDoc.html().replace(" ", ""))

  }
}
