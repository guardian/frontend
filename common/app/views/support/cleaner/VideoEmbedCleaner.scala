package views.support.cleaner

import java.net.{URL, URLEncoder}

import model.{Article, ShareLinks, VideoAsset, VideoElement}
import org.jsoup.nodes.{Document, Element}
import views.support.{HtmlCleaner, Item640}

import scala.collection.JavaConversions._

case class VideoEmbedCleaner(article: Article) extends HtmlCleaner {
  val facebookVideoEmbedUrl = "https://www.facebook.com/v2.3/plugins/video.php?href="
  def facebookVideoEmbedUrlFor(url: String) = s"$facebookVideoEmbedUrl${URLEncoder.encode(url, "UTF-8")}"

  def addShareButtons(document: Document): Unit = {
    document.getElementsByClass("element-video").foreach(element => {
      val webUrl = element.attr("data-canonical-url")
      val blockId = element.attr("data-media-id")
      val mediaPath = element.attr("data-video-poster")
      val mediaTitle = element.attr("data-video-name")

      if (!webUrl.isEmpty) {
        val html = views.html.fragments.share.blockLevelSharing(blockId, ShareLinks.createShareLinks(ShareLinks.defaultShares, href = webUrl, title = mediaTitle, mediaPath = Some(mediaPath)), article.metadata.contentType)
        element.child(0).after(html.toString())
        element.addClass("fig--has-shares")
        element.addClass("fig--narrow-caption")
        // add extra margin if there is no caption to fit the share buttons
        val figcaption = element.getElementsByTag("figcaption")
        if (figcaption.length < 1) {
          element.addClass("fig--no-caption")
        }
      }
    })
  }

  def cleanVideo(document: Document): Unit = {
    if (!article.isLiveBlog) {
      addShareButtons(document)
    }

    document.getElementsByClass("element-video").foreach { figure: Element =>
      val canonicalUrl = new URL(figure.attr("data-canonical-url")).getPath.stripPrefix("/")

      figure.attr("data-component", "video-inbody-embed")
      figure.getElementsByClass("gu-video").foreach { element: Element =>
        element
          .removeClass("gu-video")
          .addClass("js-gu-media--enhance gu-media gu-media--video")
          .attr("preload", "none")
          .attr("data-canonical-url", canonicalUrl)
          .wrap("<div class=\"gu-media-wrapper gu-media-wrapper--video u-responsive-ratio u-responsive-ratio--hd\"></div>")

        val mediaId = element.attr("data-media-id")

        val asset = findVideoFromId(mediaId)
        val video = findVideoApiElement(mediaId)

        element.getElementsByTag("source").remove()

        val sourceHTML: String = getVideoAssets(mediaId).map { videoAsset =>
          videoAsset.encoding.map { encoding =>
            s"""<source src="${encoding.url}" type="${encoding.format}"></source>"""
          }.getOrElse("")
        }.mkString("")

        element.append(sourceHTML)

        // add the poster url
        video.map(_.images).flatMap(Item640.bestFor).map(_.toString()).foreach { url =>
          element.attr("poster", url)
        }

        findVideoApiElement(mediaId).foreach { videoElement =>
          element.attr("data-block-video-ads", videoElement.videos.blockVideoAds.toString)
          if (videoElement.videos.embeddable) {
            element.attr("data-embeddable", "true")
            element.attr("data-embed-path", canonicalUrl)
          } else {
            element.attr("data-embeddable", "false")
          }
        }
      }
    }
  }

  override def clean(document: Document): Document = {
    document.getElementsByClass("element-video").filter { element: Element =>
      element.getElementsByClass("gu-video").isEmpty
    }.foreach { element: Element =>
      val canonicalUrl = element.attr("data-canonical-url")

      // As Facebook have declared that you have to use their video JS plugin, which in turn pulls in their whole JS API
      // We've decided to use the canonical URL, and create the video element here rather that CAPI, as, if it changes
      // again, we can change it here and it will also fix things retrospectively.
      if (canonicalUrl.startsWith("https://www.facebook.com")) {
        val facebookUrl = facebookVideoEmbedUrlFor(element.attr("data-canonical-url"))
        element.child(0).attr("src", facebookUrl)
      }

      element.child(0).wrap("<div class=\"embed-video-wrapper u-responsive-ratio u-responsive-ratio--hd\"></div>")
    }

    cleanVideo(document)

    document.getElementsByClass("element-witness--main").foreach { element: Element =>
      element.select("iframe").wrap("<div class=\"u-responsive-ratio u-responsive-ratio--hd\"></div>")
    }

    document
  }

  def getVideoAssets(id:String): Seq[VideoAsset] = article.elements.bodyVideos.filter(_.properties.id == id).flatMap(_.videos.videoAssets)

  def findVideoFromId(id:String): Option[VideoAsset] = getVideoAssets(id).find(_.mimeType.contains("video/mp4"))

  def findVideoApiElement(id:String): Option[VideoElement] = article.elements.bodyVideos.find(_.properties.id == id)
}
