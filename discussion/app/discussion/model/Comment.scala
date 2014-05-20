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

case class DefaultComment(id:Int, body:String, responses: Seq[Comment],  profile: Profile,
                          date: DateTime, isHighlighted: Boolean, isBlocked: Boolean,
                          override val responseTo: Option[ResponseTo], numRecommends: Int, responseCount: Int) extends Comment

case class BlankComment() extends Comment{
  val id: Int = 0
  val body: String = ""
  val responses: Seq[Comment] = Nil
  val profile: Profile = Profile("", "", "", false, false, None)
  val date: DateTime = new DateTime()
  val isHighlighted: Boolean = false
  val isBlocked: Boolean = false
  val numRecommends: Int = 0
  val responseCount: Int = 0
}


trait Comment {
  val id: Int
  val body: String
  val responses: Seq[Comment]
  val profile: Profile
  val date: DateTime
  val isHighlighted: Boolean
  val isBlocked: Boolean
  val responseTo: Option[ResponseTo] = None
  val numRecommends: Int
  val responseCount: Int
}

object Comment extends {

  def apply(json: JsValue): Comment = {
    DefaultComment(
      id = (json \ "id").as[Int],
      body = (json \ "body").as[String],
      responses = getResponses(json),
      profile = Profile(json),
      date = (json \ "isoDateTime").as[String].parseISODateTime,
      isHighlighted = (json \ "isHighlighted").as[Boolean],
      isBlocked = (json \ "status").as[String].contains("blocked"),
      responseTo = (json \\ "responseTo").headOption.map(ResponseTo(_)),
      numRecommends = (json \ "numRecommends").as[Int],
      responseCount = (json \ "metaData" \ "responseCount").asOpt[Int].getOrElse(0)
    )
  }

  def getResponses(json: JsValue): Seq[Comment] = {
    (json \\ "responses").headOption map {
      _.asInstanceOf[JsArray].value map {
        Comment(_)
      }
    } getOrElse Nil
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
