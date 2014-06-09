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
  isClosedForRecommendation: Boolean,
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
      switches = (json \ "switches").as[Seq[JsObject]] map {Switch(_)},
      isClosedForRecommendation = (json \ "isClosedForRecommendation").as[Option[Boolean]] getOrElse true
    )
  }
}

case class ProfileComments(
  profile: Profile,
  comments: Seq[Comment],
  pagination: Pagination
) extends Comments {
  val switches = Nil
}

object ProfileComments{

  def apply(json: JsValue): ProfileComments = {
    val profile = Profile(json)
    val comments = (json \ "comments").as[JsArray].value map {Comment(_, Some(profile), None)}
    ProfileComments(
      profile = profile,
      comments = comments,
      pagination = Pagination(json)
    )
  }
}

case class ProfileDiscussions(
  profile: Profile,
  discussions: Seq[DiscussionComments]
)
object ProfileDiscussions {

  def apply(json: JsValue): ProfileDiscussions = {
    val profile = Profile(json)
    val discussions = (json \ "discussions").as[JsArray].value map { d =>
      val discussion = Discussion(d)
      DiscussionComments(
        discussion = discussion,
        comments = (d \ "comments").as[JsArray].value.map { Comment(_, Some(profile), Some(discussion)) },
        pagination = Pagination(json),
        commentCount = 0,
        topLevelCommentCount = 0,
        commenterCount = 0,
        isClosedForRecommendation = (d \ "isClosedForRecommendation").as[Boolean],
        switches = Seq()
      )
    }
    ProfileDiscussions(
      profile = profile,
      discussions = discussions
    )
  }
}

case class ProfileReplies(
  profile: Profile,
  comments: Seq[Comment]
)
object ProfileReplies {

  def apply(json: JsValue): ProfileReplies = {
    val profile = Profile(json)
    val comments = (json \ "comments").as[JsArray].value map { c =>
      Comment(c, None, None)
    }
    ProfileReplies(
      profile = profile,
      comments = comments
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
