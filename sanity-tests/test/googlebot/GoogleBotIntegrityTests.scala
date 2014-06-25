package googlebot

import scala.io.Source

import org.scalatest.FunSpec
import org.scalatest.Matchers

import com.gargoylesoftware.htmlunit.Page
import com.gargoylesoftware.htmlunit.WebClient
import com.gargoylesoftware.htmlunit.html.HtmlPage
import com.gargoylesoftware.htmlunit.xml.XmlPage

class GoogleBotIntegrityTests extends FunSpec with Matchers {

  val urlsToTest = Source.fromURL(getClass.getClassLoader.getResource("resources/UrlsToTest.txt")).getLines().toSeq

  describe("Web urls Google Bot integrity tests") {
    urlsToTest /*.take(15)*/ foreach { (url) =>

      val page = httpGet(url)
      val pageType = PageTypes.getType(page)

      //page type specific tests
      pageType match {
        case Html(page: HtmlPage) =>
          it(s"The $url should contain a Title") {
            page.getTitleText() should not be (empty)
          }
        case Rss(page: XmlPage) => println("No Rss specific tests yet")
        case SiteMap(page: XmlPage) => println("No sitemap specific tests yet")
      }

      //general purpose tests
      it(s"The $url should respond with 200 OK") {
        page.getWebResponse().getStatusCode() should be(200)
      }
    }
  }

  private def httpGet(url: String): Page = {
    val webClient: WebClient = new WebClient()
    webClient.getOptions().setJavaScriptEnabled(false)
    val page: Page = webClient.getPage(url)
    val contentType = page.getWebResponse().getContentType()
    page
  }
}
