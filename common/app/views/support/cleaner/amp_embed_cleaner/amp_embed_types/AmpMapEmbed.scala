package views.support.cleaner.amp_embed_cleaner.amp_embed_types

import org.jsoup.nodes.{Document, Element}
import views.support.cleaner.amp_embed_cleaner.MatchableAmpEmbed
import scala.collection.JavaConversions._
import scala.util.matching.Regex

/**
* Created by mmcnamara on 18/04/2017.
*/
abstract class AmpMapEmbed(document: Document, figure: Element) extends MatchableAmpEmbed("iframe", "src") {
  override def getMatchingUrl(): String = {
    val iframe = figure.getElementsByTag("iframe")
    if (iframe.nonEmpty)
      iframe.first().attr("src")
    else
      ""
  }
  override def returnAmpEmbed(): Element = {
    val map = figure.clone()
    for {
      iframeElement <- map.getElementsByTag("iframe")
    } yield {
      val src = iframeElement.attr("src")
      val frameBorder = iframeElement.attr("frameborder")
      val ampMapElement = document.createElement(ampTag)
      val attrs = Map (
      "width" -> "4",
      "height" -> "3",
      "layout" -> "responsive",
      "sandbox" -> "allow-scripts allow-same-origin allow-popups",
      "frameborder" -> frameBorder,
      "src" -> src
      )
      attrs.foreach{
        case (key, value) => ampMapElement.attr(key, value)
      }
      iframeElement.replaceWith(ampMapElement)
    }
    map
  }

}

case class AmpGoogleMap(document: Document, figure: Element) extends AmpMapEmbed(document: Document, figure: Element) {
  override val urlPattern: Regex =  """^https?:\/\/www\.google\.com\/maps\/embed*""".r
}

case class AmpOtherMap(document: Document, figure: Element) extends AmpMapEmbed(document: Document, figure: Element) {
  override val urlPattern: Regex =  "".r
}

