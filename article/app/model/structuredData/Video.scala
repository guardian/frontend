package model.structuredData

import model.{Article, VideoElement, VideoPlayer}
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
      overrideIsRatioHd = None,
      embedPath = blog.content.mainVideoCanonicalPath,
      path = blog.content.mainVideoCanonicalPath,
    )

    implicit val dateToTimestampWrites = play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites
    Json.obj(
      "associatedMedia" -> Json.obj(
        "@type" -> "VideoObject",
        "name" -> player.title,
        "image" -> player.poster,
        "uploadDate" -> blog.trail.webPublicationDate,
        "thumbnail" -> player.poster,
        "thumbnailUrl" -> player.poster,
        "description" -> Html(video.videos.caption.getOrElse("")).toString(),
      ),
    )

  }

}
