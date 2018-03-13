package views.support

import conf.switches.CommercialSwitches
import org.jsoup.nodes.Document
import services.SkimLinksCache
import conf.Configuration.skimlinks._

import scala.collection.JavaConverters._

case class SkimLinksCleaner(pageUrl: String, sectionId: String) extends HtmlCleaner with CommercialSwitches {

  override def clean(document: Document): Document = {
    if (ReplaceSkimLinks.isSwitchedOn && skimlinksSections.contains(sectionId)) {
      val links = document.getElementsByAttribute("href")

      links.asScala.foreach { link =>
        val href = link.attr("href")
        if (link.tagName == "a" && SkimLinksCache.isSkimLink(href)) {
          link.attr("href", linkToSkimLink(link.attr("href")))
        }
      }
      document
    } else document
  }

  def linkToSkimLink(link: String): String = {
    val urlEncodedLink = URLEncode(link)
    s"http://go.theguardian.com/?id=$skimlinksId&url=$urlEncodedLink&sref=$pageUrl"
  }
}
