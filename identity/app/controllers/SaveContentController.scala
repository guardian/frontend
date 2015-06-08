package controllers

import java.net.URL

import conf.LiveContentApi
import common._
import implicits.Dates
import model.Content

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import client.Error
import com.google.inject.Inject
import com.gu.identity.model.{SavedArticles, SavedArticle}
import common.ExecutionContexts
import org.joda.time.DateTime

import scala.util.{Failure, Success}

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
import LiveContentApi.getResponse
import implicits.Dates

class SaveContentController @Inject() ( api: IdApiClient,
                                        identityRequestParser: IdRequestParser,
                                        authenticatedActions: AuthenticatedActions,
                                        returnUrlVerifier: ReturnUrlVerifier,
                                        savedArticleService: PlaySavedArticlesService,
                                        idUrlBuilder: IdentityUrlBuilder
                                        )
  extends Controller with ExecutionContexts with SafeLogging {

  import SavedArticleData._

  implicit val dateOrdering: Ordering[DateTime] = Ordering[Long] on { _.getMillis }

  val page = IdentityPage("/saved-for-later", "Saved for later", "saved-for-later")

  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest, path: String): String = idUrlBuilder.buildUrl(path, idRequest)


  def saveContentItem = authenticatedActions.authAction.apply { implicit request =>

    val idRequest = identityRequestParser(request)
    val userId = request.user.getId()

    (idRequest.returnUrl, idRequest.shortUrl) match {
      case (Some(returnUrl), Some(shortUrl)) => {
        savedArticleService.getOrCreateArticlesList(request.user.auth).map {
          case Right(prefs) =>
            if (!prefs.contains(shortUrl)) {
              val articleId = idRequest.articleId match {
                case Some(id) => id
                case _ =>  new URL(returnUrl).getPath.drop(1)
              }
              val savedArticles = prefs.addArticle(articleId, shortUrl)
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


  def listSavedContent = authenticatedActions.authAction.async { implicit request  =>

    val idRequest = identityRequestParser(request)

    savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap {
      case Right(savedArticles) =>
        val form = savedArticlesForm.fill(SavedArticleData(savedArticles.newestFirst.map(_.shortUrl)))
        fillFormWithApiDataAndGetResult(idRequest, form, savedArticles)
       case Left(errors) =>
        val formWithErrors = errors.foldLeft(savedArticlesForm) {
          case (formWithErrors, Error(message, decription, _, context)) =>
            formWithErrors.withError(context.getOrElse(""), message)
        }
        Future.successful(NoCache(Ok(views.html.profile.savedForLater(page, formWithErrors, List.empty, formActionUrl(idUrlBuilder, idRequest, "/saved-for-later")))))
    }
  }


  def deleteSavedContentItem  =
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
          savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap {
            case Right(savedArticles) =>
              fillFormWithApiDataAndGetResult(idRequest, formWithErrors, savedArticles)
            case Left(errors) =>
              val formWithApiErrors = buildFormFromErrors(errors)
              Future.successful(NoCache(Ok(views.html.profile.savedForLater(page, formWithApiErrors, List.empty, formActionUrl(idUrlBuilder, idRequest, "/saved-for-later")))))
          }
      }

      def onSuccess(data: SavedArticleData): Future[Result] = {
          val response: Future[Result] = savedArticleService.getOrCreateArticlesList(request.user.auth).flatMap {
            case Right(savedArticles) =>
              val form = savedArticlesForm.fill(SavedArticleData(savedArticles.articles.map(_.shortUrl)))

              val updatedArticlesViow: Option[Future[Result]] = data.deleteArticle.map {
                shortUrlOfDeletedArticle =>
                  val updatedArticles = savedArticles.removeArticle(shortUrlOfDeletedArticle)
                  val updatedResult = api.updateSavedArticles(request.user.auth, updatedArticles).flatMap {
                    case Right(updatedArticles) =>
                      fillFormWithApiDataAndGetResult(idRequest, form, updatedArticles)

                    case Left(errors) =>
                      val formWithApiErrors = buildFormFromErrors(errors)
                      fillFormWithApiDataAndGetResult(idRequest, formWithApiErrors, savedArticles)
                  }
                  updatedResult
              }

              updatedArticlesViow.getOrElse {
                val formWithError = form.withError("Error", "There was a problem with your request")
                Future.successful(
                  NoCache(Ok(views.html.profile.savedForLater(page, form, List.empty, formActionUrl(idUrlBuilder, idRequest, "/saved-for-later"))))
                )
              }

            case Left(errors) =>
              val formWithErrors = buildFormFromErrors(errors)
              Future.successful(
                NoCache(Ok(views.html.profile.savedForLater(page, formWithErrors, List.empty, formActionUrl(idUrlBuilder, idRequest, "/saved-for-later"))))
              )
          }
          response
      }

      boundForm.fold[Future[Result]](onError, onSuccess)
  }

  private def fillFormWithApiDataAndGetResult(idRequest: IdentityRequest, form: Form[SavedArticleData], updatedArticles: SavedArticles)(implicit request: RequestHeader): Future[Result] = {
    val savedApiContentItems: Iterable[Future[Option[Content]]] = updatedArticles.newestFirst.map {
      article =>
        getResponse(LiveContentApi.item(article.id, Edition.defaultEdition).showFields("webTitle,webUrl,trailText,shortUrl").showElements("all")).map(_.content.map(Content(_)))
    }

    Future.sequence(savedApiContentItems).map { savedForLaterSeq =>
      val contentList = savedForLaterSeq.toList.collect {
        case Some(content) => content
      }
      NoCache(Ok(views.html.profile.savedForLater(page, form, contentList, formActionUrl(idUrlBuilder, idRequest, "/saved-for-later"))))
    }
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

