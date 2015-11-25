package discussion.model

import play.api.libs.json.{JsNull, JsObject, JsArray, JsValue}
import common.Pagination

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
  orderBy: String,
  switches: Seq[Switch]
) extends Comments

object DiscussionComments {

  def apply(json: JsValue): DiscussionComments = {
    val discussion = Discussion((json \ "discussion").toOption.getOrElse(JsNull))
    val comments = (json \ "discussion" \"comments").as[JsArray].value map {Comment(_, None, Some(discussion))}
    DiscussionComments(
      discussion = discussion,
      comments = comments,
      pagination = DiscussionPagination(json),
      commentCount = (json \ "discussion" \ "commentCount").asOpt[Int] getOrElse 0,
      topLevelCommentCount = (json \ "discussion" \ "topLevelCommentCount").asOpt[Int] getOrElse 0,
      commenterCount =  (json \ "discussion" \ "commenterCount").asOpt[Int] getOrElse 0,
      isClosedForRecommendation = (json \ "isClosedForRecommendation").asOpt[Boolean] getOrElse true,
      orderBy = (json \ "orderBy").as[String],
      switches = (json \ "switches").as[Seq[JsObject]] map {Switch(_)}
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
object ProfileComments {
  def apply(json: JsValue): ProfileComments = {
    val profile = Profile(json)
    val comments = (json \ "comments").as[JsArray].value map { Comment(_, Some(profile), None) }
    ProfileComments(
      profile = profile,
      comments = comments,
      pagination = DiscussionPagination(json)
    )
  }
}
object ProfileReplies {
  def apply(json: JsValue): ProfileComments = {
    val comments = (json \ "comments").as[JsArray].value map { commentJson =>
      Comment(commentJson, Some(Profile((commentJson).as[JsObject])), None)
    }
    ProfileComments(
      profile = Profile(json),
      comments = comments,
      pagination = DiscussionPagination(json)
    )
  }
}

case class ProfileDiscussions(
  profile: Profile,
  discussions: Seq[DiscussionComments],
  pagination: Pagination
)
object ProfileDiscussions {

  def apply(json: JsValue): ProfileDiscussions = {
    val profile = Profile(json)
    val discussions = (json \ "discussions").as[JsArray].value map { d =>
      val discussion = Discussion(d)
      DiscussionComments(
        discussion = discussion,
        comments = (d \ "comments").as[JsArray].value.map { Comment(_, Some(profile), Some(discussion)) },
        pagination = DiscussionPagination(json),
        commentCount = 0,
        topLevelCommentCount = 0,
        commenterCount = 0,
        isClosedForRecommendation = (d \ "isClosedForRecommendation").as[Boolean],
        orderBy = (json \ "orderBy").as[String],
        switches = Seq()
      )
    }
    ProfileDiscussions(
      profile = profile,
      discussions = discussions,
      DiscussionPagination(json)
    )
  }
}

object DiscussionPagination {

  def apply(json: JsValue): Pagination = {
    Pagination(
      (json \ "currentPage").as[Int],
      (json \ "pages").asOpt[Int] getOrElse 100,
      (json \ "discussion" \ "commentCount").asOpt[Int] getOrElse 10000
    )
  }
}
