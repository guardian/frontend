package views.support.cleaner.amp_embed_cleaner.amp_embed_types

import java.net.URLDecoder

import org.jsoup.nodes.{Document, Element}
import views.support.cleaner.amp_embed_cleaner.MatchableAmpEmbed

import scala.collection.JavaConversions._
import scala.util.matching.Regex

/**
* Created by mmcnamara on 18/04/2017.
*/
abstract class AmpAudioEmbed(document: Document, figure: Element) extends MatchableAmpEmbed("iframe", "src") {
  override def getMatchingUrl(): String = {
    val iframe = figure.getElementsByTag("iframe")
    if (iframe.nonEmpty)
      iframe.first.attr("src")
    else
      ""
  }
  override def returnAmpEmbed: Element = {
    val ampAudioElement = figure.clone()
    for (iframeElement <- ampAudioElement.getElementsByTag("iframe")) yield {
      if (validIframe(iframeElement)) {
        iframeElement.replaceWith(createAmpIframeElement(document, iframeElement))
      } else {
        iframeElement.remove()
      }
    }
    ampAudioElement
  }
  def validIframe(iframe: Element): Boolean = iframe.hasAttr("src") && iframe.hasAttr("frameBorder") && iframe.hasAttr("width") && iframe.hasAttr("height")
  def createAmpIframeElement(document: Document, iframe: Element): Element = {
    val ampIframe = document.createElement("amp-iframe")
    val attrs = Map(
      "width" -> iframe.attr("width"),
      "height" -> iframe.attr("height"),
      "layout" -> "responsive",
      "sandbox" -> "allow-scripts allow-same-origin allow-popups",
      "frameborder" -> iframe.attr("frameborder"),
      "src" -> iframe.attr("src"))
    attrs.foreach {
      case (key, value) => ampIframe.attr(key, value)
    }
    ampIframe
  }
}


case class AmpAudioBoom(document: Document, figure: Element) extends AmpAudioEmbed(document: Document, figure: Element) {
  override val urlPattern: Regex = """^https?:\/\/audioboom\.com\/""".r
}


case class AmpSoundCloud(document: Document, figure: Element) extends AmpAudioEmbed(document: Document, figure: Element) {
  override val ampTag = "amp-soundcloud"
  override val urlPattern: Regex = ".*api.soundcloud.com/tracks/(\\d+).*".r
  override val matchingUrl = URLDecoder.decode(getMatchingUrl(), "UTF-8")
  override def returnAmpEmbed(): Element = {
    val soundCloudEmbed = figure.clone()
    for (iframeElement <- soundCloudEmbed.getElementsByTag("iframe")) yield {
      val soundCloudElement = getSoundCloudElement(document, iframeElement)
      soundCloudElement match {
        case Some(ampElement) => iframeElement.replaceWith(ampElement)
        case None => iframeElement.remove()
      }
    }
    soundCloudEmbed
  }
  def getSoundCloudElement(document: Document, iframeElement: Element): Option[Element] = {
    val trackId = getTrackIdFromUrl(iframeElement.attr("src"))
    trackId.map(id => createElement(document, id))
  }
  def getTrackIdFromUrl(soundcloudUrl: String): Option[String] = {
    URLDecoder.decode(soundcloudUrl, "UTF-8") match {
      case urlPattern(trackId) => {
        Some(trackId)
      }
      case _ => None
    }
  }
  def createElement(document: Document, trackId: String): Element = {
    val soundcloud = document.createElement("amp-soundcloud")
    soundcloud.attr("data-trackid", trackId)
    soundcloud.attr("data-visual", "true")
    soundcloud.attr("height", "300") // height is necessary if data-visual == true
  }
}


case class AmpOtherAudio(document: Document, figure: Element) extends AmpAudioEmbed(document: Document, figure: Element) {
  override val urlPattern: Regex = "".r
}

