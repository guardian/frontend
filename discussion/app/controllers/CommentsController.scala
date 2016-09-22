package controllers

import common.{ExecutionContexts, JsonComponent}
import discussion.model.{BlankComment, DiscussionAbuseReport, DiscussionKey}
import discussion.{DiscussionApiLike, DiscussionParams, ThreadedCommentPage, UnthreadedCommentPage}
import model.Cached.RevalidatableResult
import model.{Cached, MetaData, NoCache, SectionSummary, SimplePage, TinyResponse}
import play.api.data.Forms._
import play.api.data._
import play.api.data.validation._
import play.api.mvc.{Action, RequestHeader, Result}
import play.filters.csrf.{CSRFAddToken, CSRFCheck, CSRFConfig}

import scala.concurrent.Future
import scala.util.control.NonFatal

class CommentsController(csrfConfig: CSRFConfig, val discussionApi: DiscussionApiLike) extends DiscussionController with ExecutionContexts {

  val userForm = Form(
    Forms.mapping(
      "categoryId" -> Forms.number.verifying(ReportAbuseFormValidation.validCategoryConstraint),
      "commentId" -> Forms.number,
      "reason" -> optional(Forms.text.verifying("Reason must be 250 characters or fewer", input => Constraints.maxLength(250)(input) == Valid)),
      "email" -> optional(Forms.text.verifying("Please enter a valid email address", input => Constraints.emailAddress(input) == Valid))
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
            JsonComponent(views.html.fragments.comment(comment, comment.discussion.isClosedForRecommendation))
          else
            RevalidatableResult.Ok(views.html.fragments.comment(comment, comment.discussion.isClosedForRecommendation))
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


  val reportAbusePage = SimplePage(MetaData.make(
    "/reportAbuse",
    Some(SectionSummary.fromId("Discussion")),
    "Report Abuse",
    "GFE: Report Abuse"
  ))
  def reportAbuseForm(commentId: Int) = CSRFAddToken({
    Action {
      implicit request =>

        NoCache {
          Ok(views.html.discussionComments.reportComment(commentId, reportAbusePage, userForm))
        }
    }
  }, csrfConfig)

  val reportAbuseThankYouPage = SimplePage(MetaData.make(
    "/reportAbuseThankYou",
    Some(SectionSummary.fromId("Discussion")),
    "Report Abuse Thank You",
    "GFE: Report Abuse Thank You"
  ))


  def reportAbuseThankYou(commentId: Int) = Action.async { implicit request =>
    discussionApi.commentFor(commentId).map { comment =>
      Cached(60) {
        RevalidatableResult.Ok(views.html.discussionComments.reportCommentThankYou(comment.webUrl, reportAbuseThankYouPage))
      }
    }
  }

  object ReportAbuseFormValidation {
    val validCategory = (_: Int) match {
      case 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 => Valid
      case _ => Invalid("Please choose a category")
    }

    val validCategoryConstraint = Constraint("valid categoryId")(validCategory)
    val genericErrorMessage = "Something went wrong, please try again later."

  }

  def reportAbuseSubmission(commentId: Int) = CSRFCheck({
    Action.async { implicit request =>
    val scGuU = request.cookies.get("SC_GU_U")
      userForm.bindFromRequest.fold(
        formWithErrors => Future.successful(BadRequest(views.html.discussionComments.reportComment(commentId, reportAbusePage, formWithErrors))),
        userData => {
          discussionApi.postAbuseReport(userData, scGuU).map {
            case success if success.status == 200 => NoCache(Redirect(routes.CommentsController.reportAbuseThankYou(commentId)))
            case error => InternalServerError(views.html.discussionComments.reportComment(commentId, reportAbusePage, userForm.fill(userData), errorMessage = Some(ReportAbuseFormValidation.genericErrorMessage)))
          }.recover({
            case NonFatal(e) => InternalServerError(views.html.discussionComments.reportComment(commentId, reportAbusePage, userForm.fill(userData), errorMessage = Some(ReportAbuseFormValidation.genericErrorMessage)))
          })

        }
      )
    }
  }, config = csrfConfig)

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
          RevalidatableResult.Ok(views.html.discussionComments.discussionPage(page))
        }
      }
    } recover {
      case NonFatal(e) =>
        log.error(s"Discussion $key cannot be retrieved", e)
        InternalServerError(s"Discussion $key cannot be retrieved")
    }
  }

  private def getTopComments(key: DiscussionKey)(implicit request: RequestHeader): Future[Result] = {

    discussionApi.commentsFor(key, DiscussionParams(topComments = true)).map { comments =>
      val page = UnthreadedCommentPage(comments)

      Cached(60) {
        if (request.isJson) {
          JsonComponent(views.html.discussionComments.topCommentsList(page))
        } else {
          RevalidatableResult.Ok(views.html.discussionComments.topCommentsList(page))
        }
      }
    }
  }
}
