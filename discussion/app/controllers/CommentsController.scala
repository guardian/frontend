package controllers

import model.{MetaData, SimplePage, Cached, TinyResponse}
import play.api.data.Forms._
import play.api.libs.ws.{WS, WSResponse}
import scala.concurrent.{Await, Future}
import common.JsonComponent
import play.api.mvc.{ Action, RequestHeader, Result }
import discussion.{UnthreadedCommentPage, ThreadedCommentPage, DiscussionParams}
import discussion.model.{BlankComment, DiscussionKey, DiscussionAbuseReport}
import play.api.data._
import model.NoCache
import scala.concurrent.duration._
import scala.language.postfixOps
import play.api.Play.current


object CommentsController extends DiscussionController {

  // Used for jump to comment, comment hash location.
  def commentContextJson(id: Int) = Action.async { implicit request =>
    val params = DiscussionParams(request)
    discussionApi.commentContext(id, params) flatMap { context =>
      getComments(context._1, Some(params.copy(page = context._2)))
    }
  }
  def commentContextJsonOptions(id: Int) = Action { implicit request =>
    TinyResponse.noContent(Some("GET, OPTIONS"))
  }

  // Used for getting more replies for a specific comment.
  def commentJson(id: Int) = comment(id)
  def comment(id: Int) = Action.async { implicit request =>
    discussionApi.commentFor(id, request.getQueryString("displayThreaded")) map {
      comment =>
        Cached(60) {
          if (request.isJson)
            JsonComponent(
              "html" -> views.html.fragments.comment(comment).toString
            )
          else
            Ok(views.html.fragments.comment(comment))
        }
    }
  }

  // Get a list of comments for a discussion.
  def comments(key: DiscussionKey) = Action.async { implicit request => getComments(key) }
  def commentsJson(key: DiscussionKey) = Action.async { implicit request => getComments(key) }
  def commentsJsonOptions(key: DiscussionKey) = Action { implicit request => TinyResponse.noContent(Some("GET, OPTIONS")) }

  // Get the top comments for a discussion.
  def topCommentsJson(key: DiscussionKey) = Action.async { implicit request => getTopComments(key) }
  def topCommentsJsonOptions(key: DiscussionKey) = Action { implicit request => TinyResponse.noContent(Some("GET, OPTIONS")) }

  def reportAbuseForm(commentId: Int) = Action { implicit request =>
    val page = SimplePage(MetaData.make("/reportAbuse", "Discussion", "Report Abuse", "GFE: Report Abuse"))
    Cached(60) { Ok(views.html.discussionComments.reportComment(commentId, page)) }
  }


  def abuseReportToMap(abuseReport: DiscussionAbuseReport): Map[String, Seq[String]] = {
    val keys = abuseReport.getClass.getDeclaredFields.map(_.getName)
    val values = DiscussionAbuseReport.unapply(abuseReport).get.productIterator.toSeq
    (for(k <- keys; v <- values) yield (k -> Seq(v.toString))).toMap
  }

  def postAbuseReportToDiscussionApi(abuseReport: DiscussionAbuseReport): Future[WSResponse] = {
    val url = s"${conf.Configuration.discussion.apiRoot}/comment/${abuseReport.commentId}/reportAbuse"
    WS.url(url).withHeaders("D2-X-UID" -> conf.Configuration.discussion.d2Uid).post((abuseReportToMap(abuseReport)))
  }



  def reportAbuseSubmission(commentId: Int)  = Action { implicit request =>


    val userForm = Form(
      Forms.mapping(
        "categoryId" -> Forms.number(min = 1, max = 9),
        "commentId" -> Forms.number,
        "reason" -> optional(Forms.text(maxLength = 250)),
        "email" -> optional(Forms.email)
      )(DiscussionAbuseReport.apply)(DiscussionAbuseReport.unapply)
    )
    userForm.bindFromRequest.fold(
      formWithErrors => BadRequest(formWithErrors.errors.mkString(", ")),
      userData => {
        Await.result(postAbuseReportToDiscussionApi(userData), 2 seconds) match {
          case success if success.status == 200 => Ok(success.body)
          case error => Ok(s"Call to DAPI failed: ${error.body}" )
        }
      }
    )

  }

  private def getComments(key: DiscussionKey, optParams: Option[DiscussionParams] = None)(implicit request: RequestHeader): Future[Result] = {
    val params = optParams.getOrElse(DiscussionParams(request))
    discussionApi.commentsFor(key, params).map { comments =>
      val page = if (params.displayThreaded) {
        ThreadedCommentPage(comments)
      } else {
        UnthreadedCommentPage(comments)
      }
      Cached(60) {
        if (request.isJson) {
          JsonComponent(
            "commentsHtml" -> views.html.discussionComments.commentsList(page, renderPagination = false).toString,
            "paginationHtml" -> views.html.fragments.commentPagination(page).toString,
            "postedCommentHtml" -> views.html.fragments.comment(BlankComment()).toString,
            "lastPage" -> comments.pagination.lastPage,
            "commentCount" -> comments.commentCount
          )
        } else {
          Ok(views.html.discussionComments.discussionPage(page))
        }
      }
    }
  }

  private def getTopComments(key: DiscussionKey)(implicit request: RequestHeader): Future[Result] = {

    discussionApi.commentsFor(key, DiscussionParams(topComments = true)).map { comments =>
      val page = UnthreadedCommentPage(comments)

      Cached(60) {
        if (request.isJson) {
          JsonComponent(
            "html" -> views.html.discussionComments.topCommentsList(page).toString
          )
        } else {
          Ok(views.html.discussionComments.topCommentsList(page))
        }
      }
    }
  }
}
