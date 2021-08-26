package pagepresser

import com.netaporter.uri.Uri._
import org.jsoup.Jsoup
import org.jsoup.nodes.{Element, Document, Node}
import scala.collection.JavaConverters._
import scala.io.Source

object InteractiveImmersiveHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def canClean(document: Document): Boolean = {
    !document.getElementsByClass("is-immersive-interactive").isEmpty() &&
    document.getElementsByAttributeValue("rel", "canonical").attr("href").toLowerCase.contains("/ng-interactive/")
  }

  override def clean(document: Document, convertToHttps: Boolean): Document = {
    universalClean(document)
    removeTopBannerAds(document)
    removeReaderRevenueCallouts(document)
    removeEmailSignup(document)
    removeScripts(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    addPressedIndicatorToDocument(document)
  }

  override def removeScripts(document: Document): Document = {
    // TODO: decide how to handle scripts
    document
  }

  def removeTopBannerAds(document: Document): Document = {
    removeByClass(document, "top-banner-ad-container js-top-banner")
  }

  def hideReaderRevenue(document: Document): Document = {
    document
      .getElementsByTag("head")
      .first()
      .appendElement("script")
      .text("window.guardian.config.page.shouldHideReaderRevenue=true")

    document
  }

  def removeHeaderCallout(document: Document): Document = {
    removeByClass(document, "new-header__cta-bar")
  }

  def removeFooterCallout(document: Document): Document = {
    document
      .getElementsByAttributeValue("data-link-name", "footer : contribute-cta")
      .asScala
      .foreach(_.remove())

    document
      .getElementsByAttributeValue("data-link-name", "footer : subscribe-cta")
      .asScala
      .foreach(_.remove())

    // TODO: improve this?
    document
      .getElementsByClass("cta-bar__text")
      .asScala
      .foreach(_.remove())

    document
  }

  def removeReaderRevenueCallouts(document: Document): Document = {
    hideReaderRevenue(document)
    removeHeaderCallout(document)
    removeFooterCallout(document)
  }

  def removeEmailSignup(document: Document): Document = {
    removeByClass(document, "footer__email-container")
  }

  def addPressedIndicatorToDocument(document: Document): Document = {
    document
      .getElementsByClass("really-serious-copyright")
      .asScala
      .foreach(_.append("(pressed)"))

    document
  }

}
