package common

import model.Trail
import play.api.libs.json.{JsValue, Json}
import views.support.{Item140, Profile, ImgSrc, cleanTrailText}
import play.api.mvc.RequestHeader

object TrailToJson {
  def apply(trail: Trail)(implicit request: RequestHeader) : JsValue = {
    Json.obj(
      ("url", trail.url),
      ("headline", trail.headline),
      ("trailText", trail.trailText.map{ text =>
        cleanTrailText(text)(Edition(request)).toString()
      }),
      ("itemPicture", trail.trailPicture(5, 3).map{ img =>
        ImgSrc.imager(img, Item140)
      }),
      ("discussionId", trail.discussionId.map{ id => id }),
      ("webPublicationDate", Json.obj(
        ("timestamp", trail.webPublicationDate.getMillis),
        ("datetime",trail.webPublicationDate.toString("yyyy-MM-dd'T'HH:mm:ssZ")),
        ("datetimeShort", trail.webPublicationDate.toString("d MMM y"))
      )),
      ("sectionName", trail.sectionName)
    )
  }
}
