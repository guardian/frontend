package views.support.cleaner.amp_embed_cleaner.amp_embed_types

import org.jsoup.nodes.{Document, Element}
import views.support.cleaner.amp_embed_cleaner.MatchableAmpEmbed

import scala.collection.JavaConversions._
import scala.util.matching.Regex

/**
* Created by mmcnamara on 18/04/2017.
*/
abstract class AmpExternalVideoEmbed(document: Document, figure: Element) extends MatchableAmpEmbed("figure", "data-canonical-url") {
 val commonAttributes = Map(("width", "5"), ("height", "3"), ("layout", "responsive"))
  override def getMatchingUrl(): String = {
    if(figure.hasAttr("data-canonical-url"))
    figure.attr("data-canonical-url")
    else
    ""
  }
  override def returnAmpEmbed(): Element = {
    val externalVideo = figure.clone
    for {
      iframeElement <- externalVideo.getElementsByTag("iframe")
      ampExternalVideo <- getCustomVideoAttributes(externalVideo.attr("data-canonical-url"))
    } yield {
      val ampVideoElement = document.createElement(ampTag)
      val attributes = ampExternalVideo ++ commonAttributes
      attributes.foreach{
        case (key, value) => ampVideoElement.attr(key, value)
      }
      iframeElement.replaceWith(ampVideoElement)
    }
    externalVideo
  }
  def getCustomVideoAttributes(url: String): Option[Map[String, String]] = {
    url match {
      case urlPattern(videoId) => Some(Map("data-videoid"-> videoId))
      case _ => None
    }
  }
}


case class AmpFacebookExternalVideo(document: Document, figure: Element) extends AmpExternalVideoEmbed(document: Document, figure: Element) {
  override val ampTag = "amp-facebook"
  override val urlPattern: Regex =  """^https?:\/\/www\.facebook\.com\/([\w.]+)\/videos\/(\d+)\/""".r
  override def getCustomVideoAttributes(url: String): Option[Map[String, String]] = {
    url match {
      case urlPattern(organisation,videoId) => Some(Map("data-href"-> s"https://www.facebook.com/$organisation/videos/$videoId", "data-embed-as" -> "video"))
      case _ => None
    }
  }
}

case class AmpVimeoExternalVideo(document: Document, figure: Element) extends AmpExternalVideoEmbed(document: Document, figure: Element) {
  override val ampTag = "amp-vimeo"
  override val urlPattern: Regex =  """^https?:\/\/vimeo\.com\/(\d+).*""".r
}

case class AmpYoutubeExternalVideo(document: Document, figure: Element) extends AmpExternalVideoEmbed(document: Document, figure: Element) {
  override val ampTag = "amp-youtube"
  override val urlPattern: Regex = """^https?:\/\/www\.youtube\.com\/watch\?v=([^#&?]+).*""".r
}
