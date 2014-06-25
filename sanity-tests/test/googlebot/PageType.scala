package googlebot

import com.gargoylesoftware.htmlunit.Page
import com.gargoylesoftware.htmlunit.html.HtmlPage
import com.gargoylesoftware.htmlunit.xml.XmlPage

sealed trait PageType
case class Html(page: HtmlPage) extends PageType
case class Rss(page: XmlPage) extends PageType
case class SiteMap(page: XmlPage) extends PageType

object PageTypes {
  def getType(page: Page): PageType = {

    page match {
      case htmlPage: HtmlPage => Html(htmlPage)
      case xmlPage: XmlPage => getXmlSubType(xmlPage)
      case _ => throw new AssertionError("Page: " + page.getUrl() + " is of unsupported type: " +
        page.getClass().getSimpleName())
    }
  }

  private def getXmlSubType(xmlPage: XmlPage): PageType = {
    if (xmlPage.getByXPath("/*[local-name()='urlset']").size() > 0) {
      SiteMap(xmlPage)
    } else if (xmlPage.getByXPath("/*[local-name()='rss']").size() > 0) {
      Rss(xmlPage)
    } else {
      throw new AssertionError("Page: " + xmlPage.getUrl() + " is of unsupported type")
    }
  }
}


