package pagepresser

import org.jsoup.nodes.{Element, Document}
import scala.jdk.CollectionConverters._
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object InteractiveImmersiveHtmlCleaner extends HtmlCleaner {

  override def canClean(document: Document): Boolean = {
    // NB: from the document I couldn't find a consistent way to check if it
    // was an immersive interactive. For now, assume all articles requested to be
    // cleaned via interactive librarian can be cleaned.
    true
  }

  override def clean(document: Document, convertToHttps: Boolean): Document = {
    clean(document, convertToHttps, LocalDateTime.now())
  }

  def clean(document: Document, convertToHttps: Boolean, now: LocalDateTime): Document = {
    removeByClass(document, "top-search-box")
    removeByClass(document, "share-links")
    removeByClass(document, "user-details")
    removeByClass(document, "initially-off")
    removeByClass(document, "comment-count")
    replaceLinks(document)
    repairStaticLinks(document)
    repairStaticSources(document)
    deComboLinks(document)
    removeReaderRevenueCallouts(document)
    removeEmailSignup(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    addExtraCopyToDocument(document, now)
  }

  def hideReaderRevenue(document: Document): Document = {
    // We can hide some read revenue content by setting page config
    // The shouldHideReaderRevenue config is read by the commercial JS
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

    // some immersives define footer elements differently
    val legacyFooterCallout = Option(document.getElementById(("reader-revenue-links-footer")))
    legacyFooterCallout.foreach((el => el.remove()))

    val legacyFooterSignupIframe = Option(document.getElementById("footer__email-form"))
    legacyFooterSignupIframe.foreach(el => el.remove())

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
    val el = new Element("div")
    val date = now.format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))
    el.html(s"<i>This article was archived on ${date}. Some elements may be out of date.</i>")
    el.attr("class", "pressed-immersive-copy")

    val extraCopyStyle = new Element("style")
    val styles = """
      .pressed-immersive-copy {
        font-size: 0.75em;
        font-family: "Guardian Text Sans Web";
        padding-top: 0.5em;
        padding-bottom: 1.5em;
        padding-left: 1.1875rem;
        position: relative;
        margin: 0 auto;
        box-sizing: border-box;
      }

      @media (min-width: 30em) {
        .pressed-immersive-copy {
          max-width: 46.25rem;
        }
      }

      @media (min-width: 61.25em) {
        .pressed-immersive-copy {
            max-width: 61.25rem;
        }
      }

      @media (min-width: 71.25em) {
        .pressed-immersive-copy {
            max-width: 71.25rem;
        }
      }

      @media (min-width: 81.25em) {
        .pressed-immersive-copy {
            max-width: 81.25rem;
        }
      }
    """
    extraCopyStyle.html(styles)

    document.head().appendChild(extraCopyStyle)

    val body = document.getElementsByTag("body")
    if (!body.isEmpty()) body.first().appendChild(el)

    document
  }

}
