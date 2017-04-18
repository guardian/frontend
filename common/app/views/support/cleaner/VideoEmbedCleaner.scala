package views.support.cleaner

import java.net.{URL, URLEncoder}

import model.{Article, ShareLinks, VideoElement}
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
      val canonicalUrl = figure.attr("data-canonical-url")
      val figcaption = figure.getElementsByTag("figcaption")

      figure.attr("data-component", "video-inbody-embed")
      figure.getElementsByClass("gu-video").foreach { element: Element =>
        element
          .removeClass("gu-video")
          .addClass("js-gu-media--enhance gu-media gu-media--video")
          .attr("preload", "none")
          .wrap("<div class=\"gu-media-wrapper gu-media-wrapper--video u-responsive-ratio u-responsive-ratio--hd\"></div>")

        if (! canonicalUrl.isEmpty) {
          element.attr("data-canonical-url", new URL(canonicalUrl).getPath.stripPrefix("/"))
        }

        if (figcaption.nonEmpty) {
            val informationIcon = views.html.fragments.inlineSvg("information", "icon", List("centered-icon", "rounded-icon")).toString()
            figcaption.prepend(informationIcon)
        }

        val mediaId = element.attr("data-media-id")

        val video = findVideoApiElement(mediaId)

        // remove all sources as we add them later in a specific order
        // similar to `video.scala.html` template
        // see `common.app.model.EncodingOrdering` for order
        element.getElementsByTag("source").remove()

        // add the poster url
        video.map(_.images).flatMap(Item640.bestFor).map(_.toString()).foreach { url =>
          element.attr("poster", url)
        }

        video.foreach { videoElement =>
          videoElement.videos.encodings.map { encoding => {
            element.append(s"""<source src="${encoding.url}" type="${encoding.format}"></source>""")
          }}

          element.attr("data-block-video-ads", videoElement.videos.blockVideoAds.toString)

          if (!canonicalUrl.isEmpty && videoElement.videos.embeddable) {
            element.attr("data-embeddable", "true")
            element.attr("data-embed-path", new URL(canonicalUrl).getPath.stripPrefix("/"))
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
      element.children().headOption.foreach { child =>
        // As Facebook have declared that you have to use their video JS plugin, which in turn pulls in their whole JS API
        // We've decided to use the canonical URL, and create the video element here rather that CAPI, as, if it changes
        // again, we can change it here and it will also fix things retrospectively.
        if (canonicalUrl.startsWith("https://www.facebook.com")) {
          val facebookUrl = facebookVideoEmbedUrlFor(element.attr("data-canonical-url"))
          child.attr("src", facebookUrl)
        }

        child.wrap("<div class=\"embed-video-wrapper u-responsive-ratio u-responsive-ratio--hd\"></div>")
      }
    }

    cleanVideo(document)

    document.getElementsByClass("element-witness--main").foreach { element: Element =>
      element.select("iframe").wrap("<div class=\"u-responsive-ratio u-responsive-ratio--hd\"></div>")
    }

    document
  }

  def findVideoApiElement(id:String): Option[VideoElement] = article.elements.bodyVideos.find(_.properties.id == id)
}
