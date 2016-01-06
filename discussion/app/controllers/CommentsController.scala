package controllers

import model.{MetaData, SimplePage, Cached, TinyResponse}
import play.api.data.Forms._
import play.api.libs.ws.{WS, WSResponse}
import play.filters.csrf.{CSRFCheck, CSRFAddToken}
import scala.concurrent.{Future}
import common.{ExecutionContexts, JsonComponent}
import play.api.mvc.{Cookie, Action, RequestHeader, Result}
import discussion.{UnthreadedCommentPage, ThreadedCommentPage, DiscussionParams}
import discussion.model.{BlankComment, DiscussionKey, DiscussionAbuseReport}
import play.api.data._
import model.NoCache
import play.api.Play.current
import play.api.data.validation._

import scala.util.control.NonFatal

object CommentsController extends DiscussionController with ExecutionContexts {

  val userForm = Form(
    Forms.mapping(
      "categoryId" -> Forms.number.verifying(ReportAbuseFormValidation.validCategoryConstraint),
      "commentId" -> Forms.number,
      "reason" -> optional(Forms.text.verifying("Reason must be 250 characters or fewer", input => Constraints.maxLength(250)(input) == Valid)),
      "email" -> optional(Forms.text.verifying("Please enter a valid email address", input => Constraints.emailAddress == Valid))
    )(DiscussionAbuseReport.apply)(DiscussionAbuseReport.unapply)
  )

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


  val reportAbusePage = SimplePage(MetaData.make("/reportAbuse", "Discussion", "Report Abuse", "GFE: Report Abuse"))
  def reportAbuseForm(commentId: Int) = CSRFAddToken {
    Action {
      implicit request =>

        Cached(60) {
          Ok(views.html.discussionComments.reportComment(commentId, reportAbusePage, userForm))
        }
    }
  }

  val reportAbuseThankYouPage = SimplePage(MetaData.make("/reportAbuseThankYou", "Discussion", "Report Abuse Thank You", "GFE: Report Abuse Thank You"))


  def reportAbuseThankYou(commentId: Int) = Action { implicit request =>

    Cached(60) { Ok(views.html.discussionComments.reportCommentThankYou(commentId, reportAbuseThankYouPage)) }
  }

  def abuseReportToMap(abuseReport: DiscussionAbuseReport): Map[String, Seq[String]] = {
  Map("categoryId" -> Seq(abuseReport.categoryId.toString),
          "commentId" -> Seq(abuseReport.commentId.toString),
          "reason" -> abuseReport.reason.toSeq,
          "email" -> abuseReport.email.toSeq)
  }


  def postAbuseReportToDiscussionApi(abuseReport: DiscussionAbuseReport, cookie: Option[Cookie]): Future[WSResponse] = {
    val url = s"${conf.Configuration.discussion.apiRoot}/comment/${abuseReport.commentId}/reportAbuse"
    val headers = Seq("D2-X-UID" -> conf.Configuration.discussion.d2Uid, "GU-Client" -> conf.Configuration.discussion.apiClientHeader)
    if (cookie.isDefined) { headers :+  ("Cookie"->s"SC_GU_U=${cookie.get}") }
    WS.url(url).withHeaders(headers: _*).withRequestTimeout(2000).post(abuseReportToMap(abuseReport))

  }

  object ReportAbuseFormValidation {
    val validCategory = (_: Int) match {
      case 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 => Valid
      case _ => Invalid("Please choose a category")
    }

    val validCategoryConstraint = Constraint("valid categoryId")(validCategory)
    val genericErrorMessage = "Something went wrong, please try again later."

  }

  def reportAbuseSubmission(commentId: Int)  =  CSRFCheck {
    Action.async { implicit request =>
    val scGuU = request.cookies.get("SC_GU_U")
      userForm.bindFromRequest.fold(
        formWithErrors => Future.successful(BadRequest(views.html.discussionComments.reportComment(commentId, reportAbusePage, formWithErrors))),
        userData => {
          postAbuseReportToDiscussionApi(userData, scGuU).map {
            case success if success.status == 200 => NoCache(Redirect(routes.CommentsController.reportAbuseThankYou(commentId)))
            case error => InternalServerError(views.html.discussionComments.reportComment(commentId, reportAbusePage, userForm.fill(userData), errorMessage = Some(ReportAbuseFormValidation.genericErrorMessage)))
          }.recover({
            case NonFatal(e) => InternalServerError(views.html.discussionComments.reportComment(commentId, reportAbusePage, userForm.fill(userData), errorMessage = Some(ReportAbuseFormValidation.genericErrorMessage)))
          })

        }
      )
    }
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
