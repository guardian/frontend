package controllers

import java.net.URL

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import client.Error
import com.google.inject.Inject
import com.gu.identity.model.SavedArticle
import common.ExecutionContexts
//import controllers.SavedArticleData
import idapiclient.IdApiClient
import model.{ IdentityPage, NoCache}
import play.api.data.{Forms, Form}
import com.google.inject.Inject
import common.ExecutionContexts
import idapiclient.IdApiClient
import model.{IdentityPage, NoCache}
import play.api.mvc._
import play.filters.csrf.CSRFCheck
import services._
import utils.SafeLogging

import scala.concurrent.Future
import implicits.Articles._

class SaveContentController @Inject() ( api: IdApiClient,
                                        identityRequestParser: IdRequestParser,
                                        authenticatedActions: AuthenticatedActions,
                                        returnUrlVerifier: ReturnUrlVerifier,
                                        savedArticleService: PlaySavedArticlesService,
                                        idUrlBuilder: IdentityUrlBuilder
                                        )
  extends Controller with ExecutionContexts with SafeLogging {

  import SavedArticleData._

  val page = IdentityPage("/saved-content", "Saved content", "saved-content")

  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest, path: String): String = idUrlBuilder.buildUrl(path, idRequest)


  def saveContentItem = authenticatedActions.authAction.apply { implicit request =>

    val idRequest = identityRequestParser(request)
    val userId = request.user.getId()

    (idRequest.returnUrl, idRequest.shortUrl) match {
      case (Some(returnUrl), Some(shortUrl)) => {
        savedArticleService.getOrCreatedArticlesList(request.user.auth).map {
          case Right(prefs) =>
            if (!prefs.contains(shortUrl)) {
              val savedArticles = prefs.addArticle(new URL(returnUrl).getPath.drop(1), shortUrl)
              api.saveArticle(request.user.auth, savedArticles)
            }
          case Left(errors) => logger.error(errors.toString)
        }
        SeeOther(returnUrl)
      }
      case _ =>
        SeeOther(returnUrlVerifier.defaultReturnUrl)
    }
  }


  def listSavedContentItems = authenticatedActions.authAction.async { implicit request  =>

    val idRequest = identityRequestParser(request)

    savedArticleService.getOrCreatedArticlesList(request.user.auth).map {
      case Right(prefs) =>
        val form = savedArticeForm.fill(SavedArticleData(prefs.articles.map(_.shortUrl)))
        NoCache(Ok(views.html.profile.savedContent(page, form, prefs.articles, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
      case Left(errors) =>
        val formWithErrors = errors.foldLeft(savedArticeForm) {
          case (formWithErrors, Error(message, decription, _, context)) =>
            formWithErrors.withError(context.getOrElse(""), message)
        }
        NoCache(Ok(views.html.profile.savedContent(page, formWithErrors, List.empty, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
    }
  }

  def deleteSavedContentItem =
    authenticatedActions.authAction.async { implicit request =>
      println("delete article")
      val idRequest = identityRequestParser(request)
      val boundForm = savedArticeForm.bindFromRequest

      def buildFormFromErrors(errors: List[Error]) : Form[SavedArticleData] = {
        val formWithErrors = errors.foldLeft(savedArticeForm) {
          case (formWithErrors, Error(message, decription, _, context)) =>
            formWithErrors.withError(context.getOrElse(""), message)
        }
        formWithErrors
      }

      def onError(formWithErrors: Form[SavedArticleData]): Future[Result] = {
          logger.trace("Form error deleting saved content")
          savedArticleService.getOrCreatedArticlesList(request.user.auth).map {
            case Right(prefs) =>
              val form = savedArticeForm.fill(SavedArticleData(prefs.articles.map(_.shortUrl)))
              NoCache(Ok(views.html.profile.savedContent(page, formWithErrors, prefs.articles, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
            case Left(errors) =>
              val formWithApiErrors = buildFormFromErrors(errors)
              NoCache(Ok(views.html.profile.savedContent(page, formWithApiErrors, List.empty, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
          }
      }

      def onSuccess(data: SavedArticleData): Future[Result] = {
           logger.trace("Got FormData")

          val response: Future[Result] = savedArticleService.getOrCreatedArticlesList(request.user.auth).flatMap {
            case Right(prefs) =>
              val form = savedArticeForm.fill(SavedArticleData(prefs.articles.map(_.shortUrl)))

              val res = data.deleteArticle.map {
                shortUrlOfDeletedArticle =>
                  val updatedArticles = prefs.removeArticle(shortUrlOfDeletedArticle)
                  val result = api.saveArticle(request.user.auth, updatedArticles).map {
                    case Right(updatedArticles) =>
                      NoCache(Ok(views.html.profile.savedContent(page, form, updatedArticles.articles, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
                    case Left(errors) =>
                      val formWithApiErrors = buildFormFromErrors(errors)
                      NoCache(Ok(views.html.profile.savedContent(page, formWithApiErrors, prefs.articles, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
                  }
                  result
              }
              res.get

            case Left(errors) =>
              val formWithErrors = buildFormFromErrors(errors)
              Future.successful(
                NoCache(Ok(views.html.profile.savedContent(page, formWithErrors, List.empty, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
              )
          }
          response
      }

      boundForm.fold[Future[Result]](onError, onSuccess)
  }
}
case class SavedArticleData(shortUrls: List[String], deleteArticle: Option[String] = None)
object SavedArticleData {
  val savedArticeForm = Form (
       Forms.mapping(
         "article" -> Forms.list(Forms.text),
         "deleteArticle" -> Forms.optional(Forms.text)
       )(SavedArticleData.apply)(SavedArticleData.unapply)
  )
}

