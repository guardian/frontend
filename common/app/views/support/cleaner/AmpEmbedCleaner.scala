package views.support.cleaner

import java.net.URLDecoder

import common.Logging
import conf.switches.Switches
import model.{Article, Content, VideoAsset}
import org.jsoup.nodes.{Document, Element}
import views.support.{AmpSrcCleaner, HtmlCleaner}

import scala.collection.JavaConverters._
import scala.collection.mutable

case class AmpEmbedCleaner(article: Article) extends HtmlCleaner with Logging {


  def cleanAmpVideos(document: Document): Unit = {
    document.getElementsByTag("video").asScala.foreach(video => {
      val posterSrc = video.attr("poster")
      val newPosterSrc = AmpSrcCleaner(posterSrc).toString
      val mediaId = video.attr("data-media-id")
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

      val sourceHTML: String = getVideoAssets(mediaId).map { videoAsset =>
        videoAsset.encoding.map { encoding =>
          if (encoding.url.startsWith("https")) {
            s"""<source src="${encoding.url}" type="${encoding.format}"></source>"""
          }
        }.getOrElse("")
      }.mkString("")

      video.append(sourceHTML)
    })
  }


  sealed abstract class AmpExternalVideo(val videoId: String, val elementType: String, customAttributes: Map[String, String]){
    val commonAttributes = Map(("width", "5"), ("height", "3"), ("layout", "responsive"))
    val attributes = customAttributes ++ commonAttributes
  }

  def standardAttributes(videoId: String): Map[String,String] = Map(("data-videoid", videoId))

  def facebookAttributes(organisation: String, videoId: String): Map[String, String] = Map(
    ("data-href", s"https://www.facebook.com/$organisation/videos/$videoId"),
    ("data-embed-as", "video"))

  case class YoutubeExternalVideo(override val videoId: String) extends AmpExternalVideo(videoId, "amp-youtube", standardAttributes(videoId))
  case class VimeoExternalVideo(override val videoId: String) extends AmpExternalVideo(videoId, "amp-vimeo", standardAttributes(videoId))
  case class FacebookExternalVideo(organisation: String, override val videoId: String) extends AmpExternalVideo(videoId, "amp-facebook", facebookAttributes(organisation, videoId))


  object AmpExternalVideo {
    def getAmpExternalVideoByUrl(videoUrl: String): Option[AmpExternalVideo] = {
      val youtubePattern = """^https?:\/\/www\.youtube\.com\/watch\?v=([^#&?]+).*""".r
      val vimeoPattern = """^https?:\/\/vimeo\.com\/(\d+).*""".r
      val facebookPattern = """^https?:\/\/www\.facebook\.com\/([\w.]+)\/videos\/(\d+)\/""".r
      videoUrl match {
        case youtubePattern(videoId) => Some(YoutubeExternalVideo(videoId))
        case vimeoPattern(videoId) => Some(VimeoExternalVideo(videoId))
        case facebookPattern(organisation,videoId) => Some(FacebookExternalVideo(organisation,videoId))
        case _ => None
      }
    }

    def createElement(document: Document, elementType: String, customAttributes: Map[String, String]): Element = {
      val video = document.createElement(elementType)
      customAttributes.foreach{
        case (key, value) => video.attr(key, value)
      }
      video
    }

    def clean(document: Document): mutable.Buffer[Unit] = {
      for {
        videoElement <- document.getElementsByClass("element-video").asScala
        iframeElement <- videoElement.getElementsByTag("iframe").asScala
        ampExternalVideo <- getAmpExternalVideoByUrl(videoElement.attr("data-canonical-url"))
      } yield {
        val ampVideoElement = createElement(document, ampExternalVideo.elementType, ampExternalVideo.attributes)
        iframeElement.replaceWith(ampVideoElement)
      }
    }
  }



  def logAmpRemoval: String => Unit = {message =>
    if (Switches.LogRemovedAmpElements.isSwitchedOn)
      log.logger.info(message)
  }


  object AmpAudioElements {
    def createAmpIframeElement(document: Document, src: String, width: String, height: String, frameborder: String): Element = {
      val ampIframe = document.createElement("amp-iframe")
      val attrs = Map(
        "width" -> width,
        "height" -> height,
        "layout" -> "responsive",
        "sandbox" -> "allow-scripts allow-same-origin allow-popups",
        "frameborder" -> frameborder,
        "src" -> src)
      attrs.foreach {
        case (key, value) => ampIframe.attr(key, value)
      }
      ampIframe
    }

    def clean(document: Document): mutable.Buffer[Unit] = {
      for {
        audioElement <- document.getElementsByClass("element-audio").asScala
        iframeElement <- audioElement.getElementsByTag("iframe").asScala
      } yield {
        val soundcloudElement = AmpSoundcloud.getSoundCloudElement(document, iframeElement)
        if (soundcloudElement.nonEmpty) {
          iframeElement.replaceWith(soundcloudElement.get)
        } else {
          // if iframe is not a SoundCloud Element, replace it with amp-iframe
          val validIframe = iframeElement.hasAttr("src") && iframeElement.hasAttr("frameBorder") && iframeElement.hasAttr("width") && iframeElement.hasAttr("height")
          if (validIframe) {
            val src = iframeElement.attr("src")
            val width = iframeElement.attr("width")
            val height = iframeElement.attr("height")
            val frameBorder = iframeElement.attr("frameborder") // This is default as 0 in amp and deprecated in HTML5, I don't think it's needed
            iframeElement.replaceWith(createAmpIframeElement(document, src, width, height, frameBorder))
          } else {
            iframeElement.remove()
            val attrs  = iframeElement.attributes().asList().asScala.map(_.getKey).mkString(", ")
            logAmpRemoval(s"AMP cleaner an audio element iframe with src ${iframeElement.attr("src")} and attributes ${attrs} was removed as it was missing attributes.  ${article.content.metadata.id}")
          }
        }
      }
    }
  }


  def cleanAmpInstagram(document: Document): Unit = {
    document.getElementsByClass("element-instagram").asScala.foreach { embed: Element =>
      embed.getElementsByTag("a").asScala.map { element: Element =>
        val src = element.attr("href")
        val list = src.split("""instagram\.com/p/""")
        (if (list.length == 1) None else list.lastOption).flatMap(_.split("/").headOption).map { shortcode =>
          val instagram = document.createElement("amp-instagram")

          instagram
            .attr("data-shortcode", shortcode)
            .attr("width", "7") // 8:7 seems to be the normal ratio
            .attr("height", "8")
            .attr("layout", "responsive")

          embed
            .empty()
            .appendChild(instagram)
        }
      }
    }

  }

  def canRenderInteractive(element: Element): Boolean = {
    element.attributes().get("data-interactive").contains("iframe-wrapper") &&
    element.getElementsByTag("a").asScala.nonEmpty
  }

  def cleanAmpInteractives(document: Document): Unit = {
    document.getElementsByClass("element-interactive").asScala.foreach {
      interactive: Element =>
        if (canRenderInteractive(interactive)) {
          val link = interactive.getElementsByTag("a")
          val linkToInteractive = link.first().attr("href")
          val iframe = document.createElement("amp-iframe")
          val overflowElem = document.createElement("div")
          val placeholderElem = document.createElement("amp-img")

          // In AMP, when using the layout `responsive`, width is 100%,
          // and height is decided by the ratio between width and height.
          // https://www.ampproject.org/docs/guides/responsive/control_layout.html
          iframe.attr("width", "5")
          iframe.attr("height", "3")
          iframe.attr("layout", "responsive")
          iframe.attr("resizable", "")
          iframe.attr("sandbox", "allow-scripts allow-same-origin")
          iframe.attr("src", linkToInteractive)

          // All interactives should resize to the correct height once they load,
          // but if they don't this overflow element will show and load it fully once it is clicked
          overflowElem.addClass("cta cta--medium cta--show-more cta--show-more__unindent")
          overflowElem.text("See the full visual")
          overflowElem.attr("overflow", "")

          // This placeholder element will only show if the interactive is a main media, and then be replaced
          // as the interactive loads. In this case the LinkToInteractive is not an image so nothing will load,
          // but we need an https resource here, because the src cannot be empty
          placeholderElem.attr("layout", "fill")
          placeholderElem.attr("src", linkToInteractive)
          placeholderElem.attr("placeholder", "")

          link.remove()
          iframe.appendChild(placeholderElem)
          iframe.appendChild(overflowElem)
          interactive.appendChild(iframe)
        } else {
          interactive.remove()
          logAmpRemoval(s"AMP cleaner an interactive was removed. ${article.content.metadata.id}")
        }
    }
  }


  def cleanAmpMaps(document: Document): Unit = {
    document.getElementsByClass("element-map").asScala.foreach { embed: Element =>
      embed.getElementsByTag("iframe").asScala.foreach { element: Element =>
        val src = element.attr("src")
        val frameBorder = element.attr("frameborder")
        val elementMap = document.createElement("amp-iframe")

        // In AMP, when using the layout `responsive`, width is 100%,
        // and height is decided by the ratio between width and height.
        // https://www.ampproject.org/docs/guides/responsive/control_layout.html
        val attrs = Map(
        "width" -> "4",
        "height" -> "3",
        "layout" -> "responsive",
        "sandbox" -> "allow-scripts allow-same-origin allow-popups",
        "frameborder" -> frameBorder,
        "src" -> src
        )
        attrs.foreach {
          case (key, value) => elementMap.attr(key, value)
        }
        // The following replaces the iframe element with the newly created amp-iframe element
        // with the figure element as its parent.
        element
        .replaceWith(elementMap)
      }
    }
  }


  def cleanAmpComments(document: Document): Unit = {

    document.getElementsByClass("element-comment").asScala.foreach { figure: Element =>
      figure.getElementsByTag("img").asScala.foreach { image: Element =>
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

          logAmpRemoval(s"AMP cleaner a comment image was removed as it was missing attributes. ${article.content.metadata.id}")

        }
      }
    }
  }


  def cleanAmpEmbed(document: Document): Unit = {
    document.getElementsByClass("element-embed").asScala
      .filter(_.getElementsByTag("iframe").asScala.nonEmpty)
      .foreach(_.getElementsByTag("iframe").asScala.foreach {
        //check for soundcloud embeds and remove any others
        iframeElement: Element =>
          val soundcloudElement = AmpSoundcloud.getSoundCloudElement(document, iframeElement)
          if (soundcloudElement.nonEmpty) {
            iframeElement.replaceWith(soundcloudElement.get)
          } else
            iframeElement.remove()
            val src = iframeElement.attr("src")
            logAmpRemoval(s"AMP cleaner an embed was removed with an src of ${src}. ${article.content.metadata.id}")
      })
  }


  private def getVideoAssets(id:String): Seq[VideoAsset] = article.elements.bodyVideos.filter(_.properties.id == id).flatMap(_.videos.videoAssets)

  override def clean(document: Document): Document = {

    cleanAmpVideos(document)
    AmpExternalVideo.clean(document)
    AmpAudioElements.clean(document)
    cleanAmpMaps(document)
    cleanAmpInstagram(document)
    cleanAmpInteractives(document)
    cleanAmpComments(document)
    //run cleanAmpEmbed last as it has a generic action and can remove some embed types that are actioned by the other objects
    cleanAmpEmbed(document)

    document
  }

}
