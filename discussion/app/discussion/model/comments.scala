package discussion.model

import play.api.libs.json.{JsObject, JsArray, JsValue}

trait Comments {
  val comments: Seq[Comment]
  val pagination: Pagination
  val switches: Seq[Switch]
}

case class DiscussionComments(
  discussion: Discussion,
  comments: Seq[Comment],
  pagination: Pagination,
  commentCount: Int,
  topLevelCommentCount: Int,
  commenterCount: Int,
  switches: Seq[Switch]
) extends Comments

object DiscussionComments {

  def apply(json: JsValue): DiscussionComments = {
    val discussion = Discussion(json \ "discussion")
    val comments = (json \ "discussion" \"comments").as[JsArray].value map {Comment(_, None, Some(discussion))}
    DiscussionComments(
      discussion = discussion,
      comments = comments,
      pagination = Pagination(json),
      commentCount = (json \ "discussion" \ "commentCount").as[Int],
      topLevelCommentCount = (json \ "discussion" \ "topLevelCommentCount").as[Option[Int]] getOrElse 0,
      commenterCount =  (json \ "discussion" \ "commenterCount").as[Option[Int]] getOrElse 0,
      switches = (json \ "switches").as[Seq[JsObject]] map {Switch(_)}
    )
  }
}

case class UserComments(
  profile: Profile,
  comments: Seq[Comment],
  pagination: Pagination
) extends Comments {
  val switches = Nil
}

object UserComments{

  def apply(json: JsValue): UserComments = {
    val profile = Profile(json)
    val comments = (json \ "comments").as[JsArray].value map {Comment(_, Some(profile), None)}
    UserComments(
      profile = profile,
      comments = comments,
      pagination = Pagination(json)
    )
  }
}

case class Pagination(currentPage: Int, pages: Int, pageSize: Int, orderBy: String){
  lazy val hasMore: Boolean = currentPage < pages
}

object Pagination {

  def apply(json: JsValue): Pagination = Pagination(
    (json \ "currentPage").as[Int],
    (json \ "pages").as[Option[Int]] getOrElse -1,
    (json \ "pageSize").as[Option[Int]] getOrElse -1,
    (json \ "orderBy").as[String]
  )
}