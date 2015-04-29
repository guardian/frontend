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
        savedArticleService.getOrCreateArticlesList(request.user.auth).map {
          case Right(prefs) =>
            if (!prefs.contains(shortUrl)) {
              val savedArticles = prefs.addArticle(new URL(returnUrl).getPath.drop(1), shortUrl)
              api.updateSavedArticles(request.user.auth, savedArticles)
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

    savedArticleService.getOrCreateArticlesList(request.user.auth).map {
      case Right(prefs) =>
        val form = savedArticlesForm.fill(SavedArticleData(prefs.articles.map(_.shortUrl)))
        NoCache(Ok(views.html.profile.savedContent(page, form, prefs.articles, formActionUrl(idUrlBuilder, idRequest, "/saved-content"))))
      case Left(errors) =>
        val formWithErrors = errors.foldLeft(savedArticlesForm) {
          case (formWithErrors, Error(message, decription, _, context)) =>
            formWithErrors.withError(context.getOrElse(""), message)
        }
        NoCache(Ok(views.html.profile.savedContent(page, formWithErrors, List.empty, formActionUrl(idUrlBuilder, idRequest, "/saved-content"))))
    }
  }

  def deleteSavedContentItem =
    authenticatedActions.authAction.async { implicit request =>
      val idRequest = identityRequestParser(request)
      val boundForm = savedArticlesForm.bindFromRequest

      def buildFormFromErrors(errors: List[Error]) : Form[SavedArticleData] = {
        val formWithErrors = errors.foldLeft(savedArticlesForm) {
          case (formWithErrors, Error(message, decription, _, context)) =>
            formWithErrors.withError(context.getOrElse(""), message)
        }
        formWithErrors
      }

      def onError(formWithErrors: Form[SavedArticleData]): Future[Result] = {
          savedArticleService.getOrCreateArticlesList(request.user.auth).map {
            case Right(savedArticles) =>
              val form = savedArticlesForm.fill(SavedArticleData(savedArticles.articles.map(_.shortUrl)))
              NoCache(Ok(views.html.profile.savedContent(page, formWithErrors, savedArticles.newestFirst, formActionUrl(idUrlBuilder, idRequest, "/saved-content"))))
            case Left(errors) =>
              val formWithApiErrors = buildFormFromErrors(errors)
              NoCache(Ok(views.html.profile.savedContent(page, formWithApiErrors, List.empty, formActionUrl(idUrlBuilder, idRequest, "/saved-content"))))
          }
      }

      def onSuccess(data: SavedArticleData): Future[Result] = {
          val response: Future[Result] = savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap {
            case Right(savedArticles) =>
              val form = savedArticlesForm.fill(SavedArticleData(savedArticles.articles.map(_.shortUrl)))

              val updatedArticlesViow = data.deleteArticle.map {
                shortUrlOfDeletedArticle =>
                  val updatedArticles = savedArticles.removeArticle(shortUrlOfDeletedArticle)
                  val updatedResult = api.updateSavedArticles(request.user.auth, updatedArticles).map {
                    case Right(updatedArticles) =>
                      NoCache(Ok(views.html.profile.savedContent(page, form, updatedArticles.articles, formActionUrl(idUrlBuilder, idRequest, "/saved-content"))))
                    case Left(errors) =>
                      val formWithApiErrors = buildFormFromErrors(errors)
                      NoCache(Ok(views.html.profile.savedContent(page, formWithApiErrors, savedArticles.articles, formActionUrl(idUrlBuilder, idRequest, "/saved-content"))))
                  }
                  updatedResult
              }
              updatedArticlesViow.getOrElse {
                val formWithError = form.withError("Error", "There was a problem with your request")
                Future.successful(
                  NoCache(Ok(views.html.profile.savedContent(page, form, List.empty, formActionUrl(idUrlBuilder, idRequest, "/saved-content"))))
                )
              }

            case Left(errors) =>
              val formWithErrors = buildFormFromErrors(errors)
              Future.successful(
                NoCache(Ok(views.html.profile.savedContent(page, formWithErrors, List.empty, formActionUrl(idUrlBuilder, idRequest, "/saved-content"))))
              )
          }
          response
      }

      boundForm.fold[Future[Result]](onError, onSuccess)
  }
}
case class SavedArticleData(shortUrls: List[String], deleteArticle: Option[String] = None)
object SavedArticleData {
  val savedArticlesForm = Form (
       Forms.mapping(
         "article" -> Forms.list(Forms.text),
         "deleteArticle" -> Forms.optional(Forms.text)
       )(SavedArticleData.apply)(SavedArticleData.unapply)
  )
}

