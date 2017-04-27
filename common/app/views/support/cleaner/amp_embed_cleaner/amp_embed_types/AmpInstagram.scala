package views.support.cleaner.amp_embed_cleaner.amp_embed_types

import views.support.cleaner.amp_embed_cleaner.MatchableAmpEmbed
import org.jsoup.nodes.{Document, Element}
import scala.collection.JavaConversions._
import scala.util.matching.Regex

/**
* Created by mmcnamara on 18/04/2017.
*/
case class AmpInstagram(document: Document, figure: Element) extends MatchableAmpEmbed("a", "href") {
  override val ampTag: String = "amp-instagram"
  override val urlPattern: Regex = """^https?:\/\/www\.instagram\.com\/.\/(\w+)\/""".r
  override def getMatchingUrl(): String = {
    figure.getElementsByTag("a").map(_.attr("href")).headOption.getOrElse("")
  }
  def createInstagramElement(document: Document, src: String): Option[Element] = {
    val list = src.split( """instagram\.com/p/""")
    val instagramId = if (list.length == 1) None else list.lastOption
    instagramId.flatMap(_.split("/").headOption).map { shortcode =>
      val instagram = document.createElement("amp-instagram")
      instagram
          .attr("data-shortcode", shortcode)
          .attr("width", "7") // 8:7 seems to be the normal ratio
          .attr("height", "8")
        .attr("layout", "responsive")
    }
  }
  override def returnAmpEmbed(): Element = {
    val instagramEmbed = figure.clone()
    instagramEmbed.getElementsByTag("a").map { element: Element =>
      val src = element.attr("href")
      val instagramElement = createInstagramElement(document, src)
      instagramEmbed.empty()
      if (instagramElement.isDefined)
        instagramEmbed.appendChild(instagramElement.get)
    }
    instagramEmbed
  }
}
