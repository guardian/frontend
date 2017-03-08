package views.support.structuredData

import controllers.LiveBlogPage
import play.api.libs.json.{JsObject, Json}
import play.api.mvc.RequestHeader

object MainMedia {

  def apply(blog: LiveBlogPage)(implicit request: RequestHeader): Option[JsObject] = {

    if(blog.article.elements.hasMainVideo) {

      // if we have a main video, grab an associatedMedia from it

      blog.article.elements.mainVideo.map { video =>
        Json.obj(
          "associatedMedia" -> Video(blog, video)
        )
      }

    } else {

      // if we have a main picture, grab associatedMedia and image from it

      blog.article.elements.mainPicture.map { picture =>

        Json.obj(
          "associatedMedia" -> Image(picture),
          "image" -> Image(picture)
        )

      }

    }

  }

}
