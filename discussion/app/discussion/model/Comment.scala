package discussion
package model

import _root_.model.ISODateTimeStringNoMillis2DateTime
import org.joda.time.DateTime
import play.api.libs.json._

case class CommentCount(id: String, count: Int) {
  lazy val toJson = JsObject(
    Seq(
      "id" -> JsString(id),
      "count" -> JsNumber(count)
    )
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
  numRecommends: Int,
  responseCount: Int
)

object Comment extends {

  def apply(json: JsValue): Comment = Comment(json, Nil)

  def apply(json: JsValue, responses: Seq[Comment]): Comment = {
    Comment(
      id = (json \ "id").as[Int],
      body = (json \ "body").as[String],
      responses = responses,
      profile = Profile(json),
      date = (json \ "isoDateTime").as[String].parseISODateTime,
      isHighlighted = (json \ "isHighlighted").as[Boolean],
      isBlocked = (json \ "status").as[String].contains("blocked"),
      responseTo = (json \\ "responseTo").headOption.map(ResponseTo(_)),
      numRecommends = (json \ "numRecommends").as[Int],
      responseCount = (json \ "metaData" \ "responseCount").asOpt[Int].getOrElse(0)
    )
  }
}

case class ResponseTo(displayName: String, commentId: String)

object ResponseTo {
  def apply(json: JsValue): ResponseTo = {
    ResponseTo(
      displayName = (json \ "displayName").as[String],
      commentId = (json \ "commentId").as[String]
    )
  }
}
