package model.structuredData

import model.Article
import play.api.libs.json.{JsObject, Json}
import play.api.mvc.RequestHeader

object MainMedia {

  def apply(blog: Article)(implicit request: RequestHeader): Option[JsObject] = {

    if (blog.elements.hasMainVideo) {

      // if we have a main video, grab an associatedMedia from it

      blog.elements.mainVideo.map { video =>
        Json.obj(
          "associatedMedia" -> Video(blog, video),
        )
      }

    } else {

      // if we have a main picture, grab associatedMedia and image from it

      blog.elements.mainPicture.map { picture =>
        Json.obj(
          "associatedMedia" -> Image(picture),
          "image" -> Image(picture),
        )

      }

    }

  }

}
