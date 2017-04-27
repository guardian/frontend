package views.support.cleaner.amp_embed_cleaner.amp_embed_types

import org.jsoup.nodes.{Document, Element}
import scala.collection.JavaConversions._
import views.support.cleaner.amp_embed_cleaner.AmpEmbed

/**
* Created by mmcnamara on 18/04/2017.
*/
case class AmpInteractive(document: Document, figure: Element) extends AmpEmbed {
  def canRenderInteractive(element: Element): Boolean = {
    element.attributes().get("data-interactive").contains("iframe-wrapper") &&
      element.getElementsByTag("a").nonEmpty
  }
  override def returnAmpEmbed(): Element = {
    val interactive = figure.clone
    if (canRenderInteractive(interactive)) {
      val link = interactive.getElementsByTag("a")
      val linkToInteractive = link.first().attr("href")
      val iframe = document.createElement("amp-iframe")
      val overflowElem = document.createElement("div")
      // In AMP, when using the layout `responsive`, width is 100%,
      // and height is decided by the ratio between width and height.
      // https://www.ampproject.org/docs/guides/responsive/control_layout.html
      iframe.attr("width", "5")
      iframe.attr("height", "1")
      iframe.attr("layout", "responsive")
      iframe.attr("resizable", "")
      iframe.attr("sandbox", "allow-scripts allow-same-origin")
      iframe.attr("src", linkToInteractive)

      // All interactives should resize to the correct height once they load,
      // but if they don't this overflow element will show and load it fully once it is clicked
      overflowElem.addClass("cta cta--medium cta--show-more cta--show-more__unindent")
      overflowElem.text("See the full visual")
      overflowElem.attr("overflow", "")
      overflowElem.attr("placeholder", "")
      link.remove()
      iframe.appendChild(overflowElem)
      interactive.appendChild(iframe)
    } else {
      val emptyFigure = document.createElement("figure")
      for (iframe <- interactive.getElementsByTag("iframe")) yield {iframe.remove()}
    }
    interactive
  }
}
