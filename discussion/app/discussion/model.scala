package discussion

import org.joda.time.DateTime
import play.api.libs.json.{JsNumber, JsString, JsObject, JsValue}
import model._

case class Profile(
  avatar: String,
  displayName: String,
  isStaff: Boolean = false,
  isContributor: Boolean = false
)

object Profile{
  def apply(json: JsValue): Profile = {
    val badges = (json \ "userProfile" \ "badge" \\ "name")
    Profile(
      avatar = (json \ "userProfile" \ "avatar").as[String],
      displayName = (json \ "userProfile" \ "displayName").as[String],
      isStaff = badges.exists(_.as[String] == "Staff"),
      isContributor = badges.exists(_.as[String] == "Contributor")
    )
  }
}

case class ResponseTo(
  displayName: String,
  commentId: String
)

object ResponseTo {
  def apply(json: JsValue): ResponseTo = {
    ResponseTo(
      displayName = (json \ "displayName").as[String],
      commentId = (json \ "commentId").as[String]
    )
  }
}

case class CommentCount(
  id: String,
  count: Int
) {
  lazy val toJson = JsObject(Seq(
    "id" -> JsString(id),
    "count" -> JsNumber(count))
  )
}

case class Comment(
  id: Int,
  body: String,
  responses: Seq[Comment],
  profile: Profile,
  date: DateTime,
  isHighlighted: Boolean,
  isBlocked: Boolean,
  responseTo: Option[ResponseTo] = None,
  numRecommends: Int
)

object Comment{

  def apply(json: JsValue): Comment = Comment(json, Nil)

  def apply(json: JsValue, responses: Seq[Comment]): Comment = {
      Comment(
        id = (json \ "id").as[Int],
        body = (json \ "body").as[String],
        responses = responses,
        profile = Profile(json),
        date = (json \ "isoDateTime").as[String].parseISODateTimeNoMillis,
        isHighlighted = (json \ "isHighlighted").as[Boolean],
        isBlocked = (json \ "status").as[String].contains("blocked"),
        responseTo = (json \\ "responseTo").headOption.map(ResponseTo(_)),
        numRecommends = (json \ "numRecommends").as[Int]
    )
  }
}
