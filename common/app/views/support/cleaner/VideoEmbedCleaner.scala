package views.support.cleaner

import model.{Article, DotcomContentType, ShareLinks, VideoElement}
import org.jsoup.nodes.{Document, Element}
import views.support.{HtmlCleaner, Item640}

import java.net.{URI, URLEncoder}
import scala.jdk.CollectionConverters._

/*
 * maxEmbedHeight: 812px - full height on an iPhone X
 */
case class VideoEmbedCleaner(article: Article, maxEmbedHeight: Int = 812) extends HtmlCleaner {
  val facebookVideoEmbedUrl = "https://www.facebook.com/v2.3/plugins/video.php?href="
  def facebookVideoEmbedUrlFor(url: String): String = s"$facebookVideoEmbedUrl${URLEncoder.encode(url, "UTF-8")}"

  def addShareButtons(document: Document): Unit = {
    document
      .getElementsByClass("element-video")
      .asScala
      .foreach(element => {
        val webUrl = element.attr("data-canonical-url")
        val blockId = element.attr("data-media-id")
        val mediaPath = element.attr("data-video-poster")
        val mediaTitle = element.attr("data-video-name")

        if (!webUrl.isEmpty) {
          val html = views.html.fragments.share.blockLevelSharing(
            blockId,
            ShareLinks.createShareLinks(
              ShareLinks.defaultShares,
              href = webUrl,
              title = mediaTitle,
              mediaPath = Some(mediaPath),
            ),
            article.metadata.contentType.getOrElse(DotcomContentType.Unknown),
          )
          element.child(0).after(html.toString())
          element.addClass("fig--has-shares")
          element.addClass("fig--narrow-caption")
          // add extra margin if there is no caption to fit the share buttons
          val figcaption = element.getElementsByTag("figcaption").asScala
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

    document.getElementsByClass("element-video").asScala.foreach { figure: Element =>
      val canonicalUrl = figure.attr("data-canonical-url")
      val figcaption = figure.getElementsByTag("figcaption")

      figure.attr("data-component", "video-inbody-embed")
      figure.getElementsByClass("gu-video").asScala.foreach { element: Element =>
        element
          .removeClass("gu-video")
          .addClass("js-gu-media--enhance gu-media gu-media--video")
          .attr("preload", "none")
          .wrap(
            "<div class=\"gu-media-wrapper gu-media-wrapper--video u-responsive-ratio u-responsive-ratio--hd\"></div>",
          )

        if (canonicalUrl.nonEmpty) {
          element.attr("data-canonical-url", new URI(canonicalUrl).getPath.stripPrefix("/"))
        }

        if (figcaption.asScala.nonEmpty) {
          val informationIcon = views.html.fragments.inlineSvg("triangle", "icon").toString()
          figcaption.prepend(informationIcon)
        }

        val mediaId = element.attr("data-media-id")

        val video = findVideoApiElement(mediaId)

        // remove all sources as we add them later in a specific order
        // similar to `video.scala.html` template
        // see `common.app.model.EncodingOrdering` for order
        element.getElementsByTag("source").remove()

        // add the poster url
        video.map(_.images).flatMap(Item640.bestSrcFor).foreach(element.attr("poster", _))

        video.foreach { videoElement =>
          videoElement.videos.encodings.map { encoding =>
            {
              element.append(s"""<source src="${encoding.url}" type="${encoding.format}"></source>""")
            }
          }

          element.attr("data-block-video-ads", videoElement.videos.blockVideoAds.toString)

          if (canonicalUrl.nonEmpty && videoElement.videos.embeddable) {
            element.attr("data-embeddable", "true")
            element.attr("data-embed-path", new URI(canonicalUrl).getPath.stripPrefix("/"))
          } else {
            element.attr("data-embeddable", "false")
          }
        }
      }
    }
  }

  override def clean(document: Document): Document = {
    document
      .getElementsByClass("element-video")
      .asScala
      .filter { element: Element =>
        element.getElementsByClass("gu-video").isEmpty
      }
      .foreach { element: Element =>
        val canonicalUrl = element.attr("data-canonical-url")
        element.children().asScala.headOption.foreach { child =>
          // As Facebook have declared that you have to use their video JS plugin, which in turn pulls in their whole JS API
          // We've decided to use the canonical URL, and create the video element here rather that CAPI, as, if it changes
          // again, we can change it here and it will also fix things retrospectively.
          if (canonicalUrl.startsWith("https://www.facebook.com")) {
            val facebookUrl = facebookVideoEmbedUrlFor(element.attr("data-canonical-url"))
            child.attr("src", facebookUrl)
          }

          val someIframe = Option(element.select("iframe").first())

          someIframe match {
            case Some(iframe) =>
              if (canonicalUrl.startsWith("https://player.vimeo.com")) {
                addVimeoDntFlag(iframe)
              }
              wrapIframe(child, iframe)
            case None => wrapHD(child)
          }
        }
      }

    cleanVideo(document)

    document.getElementsByClass("element-witness--main").asScala.foreach { element: Element =>
      element.select("iframe").wrap("<div class=\"u-responsive-ratio u-responsive-ratio--hd\"></div>")
    }

    document
  }

  private def addVimeoDntFlag(iframe: Element): Unit = {
    val src = iframe.attr("src")
    iframe.attr("src", src ++ (if (src.contains("?")) "&" else "?") ++ "dnt=true")
  }

  private def wrapIframe(container: Element, iframe: Element): Unit = {
    // Has no id to get data from capi so try and get from iframe
    val videoWidth = iframe.attr("width")
    val videoHeight = iframe.attr("height")
    val hasWidth = videoWidth != "" && videoWidth != "0"
    val hasHeight = videoHeight != "" && videoHeight != "0"

    if (hasWidth && hasHeight) {
      wrapCustom(container, videoWidth.toFloat, videoHeight.toFloat)
    } else {
      wrapHD(container)
    }
  }

  private def wrapCustom(container: Element, width: Float, height: Float): Unit = {
    val aspectRatio = width / height
    val maxWidth = maxEmbedHeight * aspectRatio
    val paddingBottom = (1 / aspectRatio) * 100
    container.wrap(
      s"""<div class="u-responsive-aligner" style="max-width: ${maxWidth}px;"><div class="embed-video-wrapper u-responsive-ratio" style="padding-bottom: ${paddingBottom}%;"></div></div>""",
    )
  }

  private def wrapHD(container: Element): Unit = {
    container.wrap("""<div class="embed-video-wrapper u-responsive-ratio u-responsive-ratio--hd"></div>""")
  }

  def findVideoApiElement(id: String): Option[VideoElement] = article.elements.bodyVideos.find(_.properties.id == id)
}
