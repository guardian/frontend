package pagepresser

import com.netaporter.uri.Uri._
import org.jsoup.Jsoup
import org.jsoup.nodes.{Element, Document}
import scala.collection.JavaConverters._
import scala.io.Source
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object InteractiveImmersiveHtmlCleaner extends HtmlCleaner {

  override def canClean(document: Document): Boolean = {
    !document.getElementsByClass("is-immersive-interactive").isEmpty() &&
    document.getElementsByAttributeValue("rel", "canonical").attr("href").toLowerCase.contains("/ng-interactive/")
  }

  override def clean(document: Document, convertToHttps: Boolean): Document = {
    clean(document, convertToHttps, LocalDateTime.now())
  }

  def clean(document: Document, convertToHttps: Boolean, now: LocalDateTime): Document = {
    universalClean(document)
    removeTopBannerAds(document)
    removeReaderRevenueCallouts(document)
    removeEmailSignup(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    addExtraCopyToDocument(document, now)
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

  def addExtraCopyToDocument(document: Document, now: LocalDateTime): Document = {
    val el = new Element("p")
    val date = now.format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))
    el.html(s"<i>This article was archived on ${date}. Some elements may be out of date.</i>")

    val footers = document.getElementsByTag("footer")
    if (!footers.isEmpty()) footers.first().before(el)

    document
  }

}
