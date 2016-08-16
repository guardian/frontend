package views.support.cleaner

import model.{Article, VideoAsset}
import org.jsoup.nodes.{Document, Element}
import views.support.{AmpSrcCleaner, HtmlCleaner}

import scala.collection.JavaConversions._

case class AmpEmbedCleaner(article: Article) extends HtmlCleaner {

  def cleanAmpVideos(document: Document): Unit = {
    document.getElementsByTag("video").foreach(video => {
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

  def cleanAmpYouTube(document: Document) = {

    document.getElementsByClass("element-video").filter { element: Element =>
      element.getElementsByTag("iframe").length != 0
    }.foreach { element: Element =>
      element.getElementsByTag("iframe").map { element: Element =>
        element.remove()
      }
      val youtubeUrl = element.attr("data-canonical-url")
      youtubeUrl.split("v=").lastOption.map { youtubeId =>
        val youtube = document.createElement("amp-youtube")
        youtube.attr("data-videoid", youtubeId)
        youtube.attr("width", "5")
        youtube.attr("height", "3")
        youtube.attr("layout", "responsive")
        element.appendChild(youtube)
      }
    }

  }

  def cleanAmpEmbed(document: Document) = {

    document.getElementsByClass("element-embed").filter { element: Element =>
      element.getElementsByTag("iframe").length != 0
    }.foreach { embed: Element =>
      embed.getElementsByTag("iframe").map { element: Element =>
        val src = element.attr("srcdoc") // TODO it's a hack searching through the doc but CAPI doesn't have the shortcode yet
        val list = src.split("""instagram\.com/p/""")
        (if (list.length == 1) None else list.lastOption).flatMap(_.split("/").headOption).map { shortcode =>
          val instagram = document.createElement("amp-instagram")
          instagram.attr("shortcode", shortcode)
          instagram.attr("width", "7")// 8:7 seems to be the normal ratio
          instagram.attr("height", "8")
          instagram.attr("layout", "responsive")
          embed.appendChild(instagram)
        }
        element.remove()
      }
    }

  }

  def cleanAmpInteractives(document: Document) = {

    document.getElementsByClass("element-interactive").filter { element: Element =>
      element.getElementsByTag("a").length !=0
    }.foreach { interactive: Element =>
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

      link.remove()
      iframe.appendChild(overflowElem)
      interactive.appendChild(iframe)
    }
  }

  private def getVideoAssets(id:String): Seq[VideoAsset] = article.elements.bodyVideos.filter(_.properties.id == id).flatMap(_.videos.videoAssets)

  override def clean(document: Document): Document = {

    cleanAmpVideos(document)
    cleanAmpYouTube(document)
    cleanAmpInteractives(document)
    cleanAmpEmbed(document)

    document
  }

}
