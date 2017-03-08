package views.support.structuredData

import controllers.LiveBlogPage
import model.{EndSlateComponents, VideoElement, VideoPlayer}
import play.api.libs.json.{JsValue, Json}
import play.twirl.api.Html
import views.support.Video640

object Video {

  def apply(blog: LiveBlogPage, video: VideoElement): JsValue = {

    val player = VideoPlayer(
      video,
      Video640,
      blog.article.trail.headline,
      autoPlay = false,
      showControlsAtStart = true,
      endSlatePath = EndSlateComponents.fromContent(blog.article.content).toUriPath,
      overrideIsRatioHd = None,
      embedPath = blog.article.content.mainVideoCanonicalPath,
      path = blog.article.content.mainVideoCanonicalPath
    )

    Json.obj(
      "associatedMedia" -> Json.obj(
        "@type" -> "VideoObject",
        "name" -> player.title,
        "image" -> player.poster,
        "uploadDate" -> blog.article.trail.webPublicationDate,
        "thumbnail" -> player.poster,
        "thumbnailUrl" -> player.poster,
        "description" -> Html(video.videos.caption.getOrElse("")).toString()
      )
    )

  }

}
