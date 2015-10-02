package views.support.cleaner

import java.net.URL

import model.{Article, VideoAsset, VideoElement}
import org.jsoup.nodes.{Document, Element}
import views.support.{HtmlCleaner, Item640}

import scala.collection.JavaConversions._

case class AmpVideoEmbedCleaner(article: Article) extends HtmlCleaner {

  def cleanAmpVideos(document: Document): Unit = {
    document.getElementsByTag("video").foreach(video => {
      video.tagName("amp-video")
      video.removeAttr("data-media-id")
      video.removeAttr("poster")

      // Need to hard code aspect ratio 5:3 for Amp pages.
      video.attr("width", "5")
      video.attr("height", "3")
      // Layout responsive keeps the aspect ratio, but ignores the height and width attributes above
      video.attr("layout", "responsive")
      video.attr("controls", "")

      video.getElementsByTag("source").foreach(source => {
        val videoSrc = source.attr("src")
        // All videos need to start with https for AMP.
        // Temperary code until all videos returned from CAPI are https
        if (!videoSrc.startsWith("https")) {
          val (first, last) = videoSrc.splitAt(4);
          val newSrc = first + "s" + last
          source.attr("src", newSrc)
        }
      })
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
      val youtubeId = youtubeUrl.split("v=").last
      val youtube = document.createElement("amp-youtube")
      youtube.attr("video-id", youtubeId)
      youtube.attr("width", "5")
      youtube.attr("height", "3")
      youtube.attr("layout", "responsive")
      element.appendChild(youtube)
    }

  }

  override def clean(document: Document): Document = {

    cleanAmpVideos(document)
    cleanAmpYouTube(document)

    document
  }

}
