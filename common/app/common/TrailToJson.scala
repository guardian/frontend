package common

import model.Trail
import play.api.libs.json.{JsValue, Json}
import views.support.{Profile, ImgSrc, cleanTrailText}
import play.api.mvc.RequestHeader

object TrailToJson {
  def apply(trail: Trail)(implicit request: RequestHeader) : JsValue = {
    Json.obj(
      ("url", trail.url),
      ("headline", trail.headline),
      ("shortUrl", trail.shortUrl),
      ("trailText", trail.trailText.map{ text =>
        cleanTrailText(text)(Edition(request)).toString()
      }),
      ("itemPicture", trail.trailPicture(5,3).map{ trailPictures =>
        trailPictures.largestImage.map { largestImage =>
          largestImage.url.map(ImgSrc(_, Profile("item-{width}")))
        }
      }),
      ("webPublicationDate", Json.obj(
        ("timestamp", trail.webPublicationDate.getMillis),
        ("datetime",trail.webPublicationDate.toString("yyyy-MM-dd'T'HH:mm:ssZ")),
        ("datetimeShort", trail.webPublicationDate.toString("d MMM y"))
      ))
    )
  }
}
