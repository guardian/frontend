package views.support.cleaner

import java.net.URLDecoder

import model.{Elements, Article, VideoAsset}
import org.jsoup.nodes.{Document, Element}
import views.support.{AmpSrcCleaner, HtmlCleaner}
import scala.collection.JavaConversions._
import scala.util.matching.Regex

/**
 * Created by mmcnamara on 04/04/17.
 */
abstract class AmpElement {
val ampTag: String = "amp-iframe"
def returnAmpEmbed(document: Document, element: Element): Element

}

abstract class MatchableAmpElement(urlLocationTag: String, urlTagId: String) extends AmpElement {

  val matchingUrl: String

  val urlPattern: Regex

  def getMatchingUrl(element: Element): String

  def isAMatch(): Boolean = urlPattern.findFirstIn(matchingUrl).isDefined

  def getAttrib(element: Element, name: String): String = {
    if(element.hasAttr(name))
      element.attr(name)
    else
      ""
  }

}



abstract class AmpAudioElement extends MatchableAmpElement("iframe", "src") {
  override def getMatchingUrl(element: Element): String = {
    val iframe = element.getElementsByTag("iframe").first()
    getAttrib(iframe, "src")
  }

  override def returnAmpEmbed(document: Document, element: Element): Element = {
    val ampAudioElement = element
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


abstract class AmpExternalVideoElement extends MatchableAmpElement("figure", "data-canonical-url") {
  override def getMatchingUrl(element: Element): String = {
    getAttrib(element,"data-canonical-url")
  }


}

abstract class AmpMapElement extends MatchableAmpElement("iframe", "src") {
  override def getMatchingUrl(element: Element): String = {
    val iframe = element.getElementsByTag("iframe").first()
    getAttrib(iframe,"src")
  }

  override def returnAmpEmbed(document: Document, element: Element): Element = {
    val externalVideo = element
    for {
      iframeElement <- externalVideo.getElementsByTag("iframe")
      ampExternalVideo <- getAmpExternalVideoByUrl(externalVideo.attr("data-canonical-url"))
    } yield {
      val ampVideoElement = createElement(document, ampTag, ampExternalVideo.attributes)
      iframeElement.replaceWith(ampVideoElement)
    }
  }

  def getAmpExternalVideoByUrl(url: String)

}


case class AmpComments(document: Document, figure: Element) extends AmpElement {
  override def returnAmpEmbed(document: Document, element: Element): Element = {
    val comment = element
    comment.getElementsByTag("img").foreach{ image: Element =>
      val validImage = image.hasAttr("class") && image.attr("class").contains("d2-avatar") && image.hasAttr("src") && image.hasAttr("height") && image.hasAttr("width") && image.hasAttr("alt")
      if (validImage) {
        val ampImg = document.createElement("amp-img")
        val attrs = Map(
          "class" -> ("d2-avatar-image " + image.attr("class")),
          "src" -> image.attr("src"),
          "height" -> image.attr("height"),
          "width" -> image.attr("width"),
          "alt" -> image.attr("alt"),
          "layout" -> "fixed")
        attrs.foreach {
          case (key, value) => ampImg.attr(key, value)
        }
        image.replaceWith(ampImg)
      } else {
        image.remove()
      }
  }
  comment
}


case class AmpInteractive(document: Document, figure: Element) extends AmpElement {

  def canRenderInteractive(element: Element): Boolean = {
    element.attributes().get("data-interactive").contains("iframe-wrapper") &&
      element.getElementsByTag("a").nonEmpty
  }
  override def returnAmpEmbed(document: Document, element: Element): Element = {
    val interactive = element
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
      interactive.remove()
    }
    interactive
  }
}



class AmpVideoElement(document: Document, video: Element, videoAssets: Seq[VideoAsset]) extends AmpElement {

  override def returnAmpEmbed(document: Document, element: Element): Element = {
    val video = element
    val posterSrc = video.attr("poster")
    val newPosterSrc = AmpSrcCleaner(posterSrc).toString
    val fallback = "<div fallback > Sorry, your browser is unable to play this video.<br/> Please <a href='http://whatbrowser.org/'>upgrade</a> to a modern browser and try again.</div>"
    video.tagName("amp-video")
    video.removeAttr("data-media-id")
    video.getElementsByTag("source").remove()
    video.append(fallback)
    video.attr("poster", newPosterSrc)
    // Need to hard code aspect ratio 5:3 for Amp pages.
    video.attr("width", "5")
    video.attr("height", "3")
    // Layout responsive keeps the aspect ratio, but ignores the height and width attributes above
    video.attr("layout", "responsive")
    video.attr("controls", "")

    val sourceHTML: String = videoAssets.map { videoAsset =>
      videoAsset.encoding.map { encoding =>
        if (encoding.url.startsWith("https")) {
          s"""<source src="${encoding.url}" type="${encoding.format}"></source>"""
        }
      }.getOrElse("")
    }.mkString("")

    video.append(sourceHTML)
  }

}



case class AmpInstagram(document: Document, figure: Element) extends MatchableAmpElement("a", "href") {
  override val ampTag = "amp-instagram"
  override val urlPattern = """^\/\/platform\.instagram\/.com\/*""".r
  override val matchingUrl = getMatchingUrl(figure)

  def getHref(iframe: Element): String = {
    iframe.getElementsByTag("a").map(_.attr("href")).headOption.getOrElse("")
  }

  override def getMatchingUrl(element: Element): String = {
    val iframe = element.getElementsByTag("iframe").first()
    getHref(iframe)
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

  override def returnAmpEmbed(document: Document, element: Element): Element = {
    val instagramEmbed = element
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


  case class AmpSoundCloud(document: Document, figure: Element) extends AmpAudioElement {
    override val ampTag = "amp-soundcloud"
    override val matchingUrl = getMatchingUrl(figure)
    override val urlPattern = ".*api.soundcloud.com/tracks/(\\d+).*".r

    override def returnAmpEmbed(document: Document, element: Element): Element = {
      val soundCloudEmbed = element
      for (iframeElement <- soundCloudEmbed.getElementsByTag("iframe")) yield {
        val soundCloudElement = getSoundCloudElement(document, iframeElement)
        soundCloudElement match {
          case Some(ampElement) => iframeElement.replaceWith(ampElement)
          case None  => iframeElement.remove()
        }
      }
      soundCloudEmbed
    }

    def getSoundCloudElement(document: Document, iframeElement: Element): Option[Element] = {
      val trackId = getTrackIdFromUrl(iframeElement.attr("src"))
      trackId.map(id => createElement(document, id))
    }

    def getTrackIdFromUrl(soundcloudUrl: String): Option[String] = {
      URLDecoder.decode(soundcloudUrl,"UTF-8") match {
        case urlPattern(trackId) => {
          Some(trackId)}
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

case class AmpAudioBoom(document: Document, figure: Element) extends AmpAudioElement {
  override val matchingUrl = getMatchingUrl(figure)
  override val urlPattern = """^https?:\/\/audioboom\.com\/""".r
}

case class AmpOtherAudio(document: Document, figure: Element) extends AmpAudioElement {
  override val matchingUrl = getMatchingUrl(figure)
  override val urlPattern = "".r


}



case class AmpYoutubeExternalVideo(document: Document, figure: Element) extends AmpExternalVideoElement {
  override val ampTag = "amp-youtube"
  override val matchingUrl = getMatchingUrl(figure)
  override val urlPattern =  """^https?:\/\/www\.youtube\.com\/watch\?v=([^#&?]+).*""".r
  override def returnAmpEmbed(document: Document, element: Element): Element = {
    val externalVideo = element
    for {
      iframeElement <- externalVideo.getElementsByTag("iframe")
      ampExternalVideo <- getAmpExternalVideoByUrl(externalVideo.attr("data-canonical-url"))
    } yield {
      val ampVideoElement = createElement(document, ampTag, ampExternalVideo.attributes)
      iframeElement.replaceWith(ampVideoElement)
    }
  }



}

case class AmpVimeoExternalVideo(document: Document, figure: Element) extends AmpExternalVideoElement {
  override val ampTag = "amp-vimeo"
  override val matchingUrl = getMatchingUrl(figure)
  override val urlPattern =  """^https?:\/\/vimeo\.com\/(\d+).*""".r
  override def returnAmpEmbed(document: Document, element: Element): Element = {

  }

}

case class AmpFacebookExternalVideo(document: Document, figure: Element) extends AmpExternalVideoElement {
  override val ampTag = "amp-facebook"
  override val matchingUrl = getMatchingUrl(figure)
  override val urlPattern =  """^https?:\/\/www\.facebook\.com\/([\w.]+)\/videos\/(\d+)\/""".r
  override def returnAmpEmbed(document: Document, element: Element): Element = {

  }

}



case class AmpGoogleMap(document: Document, figure: Element) extends AmpMapElement {
  override val matchingUrl = getMatchingUrl(figure)
  override val urlPattern =  """^https?:\/\/www\.google\.com\/maps\/embed*""".r
  override def returnAmpEmbed(document: Document, element: Element): Element = {

  }

}

case class AmpOtherMap(document: Document, figure: Element) extends AmpMapElement {
  override val matchingUrl = getMatchingUrl(figure)
  override val urlPattern =  "".r
  override def returnAmpEmbed(document: Document, element: Element): Element = {

  }

}








