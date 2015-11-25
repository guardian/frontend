package discussion
package model

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

case class DefaultComment(
  id:Int, body:String,
  responses: Seq[Comment],
  profile: Profile,
  discussion: Discussion,
  date: DateTime,
  isHighlighted: Boolean,
  isBlocked: Boolean,
  override val responseTo: Option[ResponseTo],
  numRecommends: Int,
  responseCount: Int,
  webUrl: String
) extends Comment

case class BlankComment() extends Comment{
  val id: Int = 0
  val body: String = ""
  val responses: Seq[Comment] = Nil
  val profile: Profile = Profile("", "", "", "", isStaff = false, isContributor = false, None)
  val discussion: Discussion = Discussion.empty
  val date: DateTime = new DateTime()
  val isHighlighted: Boolean = false
  val isBlocked: Boolean = false
  val numRecommends: Int = 0
  val responseCount: Int = 0
  val webUrl: String = ""
}


trait Comment {
  val id: Int
  val body: String
  val responses: Seq[Comment]
  val profile: Profile
  val discussion: Discussion
  val date: DateTime
  val isHighlighted: Boolean
  val isBlocked: Boolean
  val responseTo: Option[ResponseTo] = None
  val numRecommends: Int
  val responseCount: Int
  val webUrl: String
}

object Comment extends implicits.Dates {

  def apply(json: JsValue, profileOpt: Option[Profile], discussionOpt: Option[Discussion]): Comment = {
    val discussion = discussionOpt getOrElse {Discussion((json \ "discussion").getOrElse(JsNull))}
    DefaultComment(
      id = (json \ "id").as[Int],
      body = (json \ "body").as[String],
      responses = getResponses(json, Some(discussion)),
      profile = profileOpt getOrElse Profile(json),
      discussion = discussion,
      date = (json \ "isoDateTime").as[String].parseISODateTime,
      isHighlighted = (json \ "isHighlighted").as[Boolean],
      isBlocked = (json \ "status").as[String].contains("blocked"),
      responseTo = (json \ "responseTo").asOpt[JsValue].map(ResponseTo(_)),
      numRecommends = (json \ "numRecommends").as[Int],
      responseCount = (json \ "metaData" \ "responseCount").asOpt[Int].getOrElse(0),
      webUrl = (json \ "webUrl").as[String]
    )
  }

  def getResponses(json: JsValue, discussionOpt: Option[Discussion]): Seq[Comment] = {
    (json \\ "responses").headOption map {
      _.asInstanceOf[JsArray].value map {Comment(_, None, discussionOpt)}
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

case class Discussion(
  key: String,
  title: String,
  apiUrl: String,
  webUrl: String,
  isClosedForComments: Boolean,
  isClosedForRecommendation: Boolean
)

object Discussion {
  lazy val empty = Discussion("", "", "", "", isClosedForComments = false, isClosedForRecommendation = false)

  def apply(json: JsValue): Discussion = Discussion(
    (json \ "key").as[String],
    (json \ "title").as[String],
    (json \ "apiUrl").as[String],
    (json \ "webUrl").as[String],
    (json \ "isClosedForComments").asOpt[Boolean] getOrElse false,
    (json \ "isClosedForRecommendation").asOpt[Boolean] getOrElse false
  )
}
