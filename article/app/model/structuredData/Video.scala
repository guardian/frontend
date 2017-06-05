package model.structuredData

import model.{Article, EndSlateComponents, VideoElement, VideoPlayer}
import play.api.libs.json.{JsValue, Json}
import play.twirl.api.Html
import views.support.Video640

object Video {

  def apply(blog: Article, video: VideoElement): JsValue = {

    val player = VideoPlayer(
      video,
      Video640,
      blog.trail.headline,
      autoPlay = false,
      showControlsAtStart = true,
      endSlatePath = EndSlateComponents.fromContent(blog.content).toUriPath,
      overrideIsRatioHd = None,
      embedPath = blog.content.mainVideoCanonicalPath,
      path = blog.content.mainVideoCanonicalPath
    )

    Json.obj(
      "associatedMedia" -> Json.obj(
        "@type" -> "VideoObject",
        "name" -> player.title,
        "image" -> player.poster,
        "uploadDate" -> blog.trail.webPublicationDate,
        "thumbnail" -> player.poster,
        "thumbnailUrl" -> player.poster,
        "description" -> Html(video.videos.caption.getOrElse("")).toString()
      )
    )

  }

}
