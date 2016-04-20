package views.support.cleaner

import java.net.URL

import model.{Article, VideoAsset, VideoElement, ShareLinks}
import org.jsoup.nodes.{Document, Element}
import views.support.{HtmlCleaner, Item640}
import scala.collection.JavaConversions._

case class VideoEmbedCleaner(article: Article) extends HtmlCleaner {

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
      figure.getElementsByClass("gu-video").foreach { element: Element =>
        element
          .removeClass("gu-video")
          .addClass("js-gu-media--enhance gu-media gu-media--video")
          .attr("preload", "none")
          .attr("data-canonical-url", canonicalUrl)
          .wrap("<div class=\"gu-media-wrapper gu-media-wrapper--video u-responsive-ratio u-responsive-ratio--hd\"></div>")

        val flashMediaElement = conf.Static("flash/components/mediaelement/flashmediaelement.swf").path

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

        asset.foreach(video => {
          element.append(
            s"""<object type="application/x-shockwave-flash" data="$flashMediaElement" width="620" height="350">
                  <param name="allowFullScreen" value="true" />
                  <param name="movie" value="$flashMediaElement" />
                  <param name="flashvars" value="controls=true&amp;file=${video.url.getOrElse("")}" />
                  Sorry, your browser is unable to play this video.
                </object>""")

        })

        findVideoApiElement(mediaId).foreach { videoElement =>
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
      element.getElementsByClass("gu-video").length == 0
    }.foreach { element: Element =>
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
