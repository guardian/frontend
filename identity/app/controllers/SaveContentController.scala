package controllers

import java.net.URL

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import client.Error
import com.google.inject.Inject
import common.ExecutionContexts
import idapiclient.IdApiClient
import model.{FrontendSavedArticle, IdentityPage, NoCache}
import play.api.data.{Forms, Form}
import play.api.mvc._
import play.filters.csrf.CSRFCheck
import services._
import utils.SafeLogging

import scala.concurrent.Future

class SaveContentController @Inject() ( api: IdApiClient,
                                        identityRequestParser: IdRequestParser,
                                        authenticatedActions: AuthenticatedActions,
                                        returnUrlVerifier: ReturnUrlVerifier,
                                        savedArticleService: PlaySavedArticlesService,
                                        idUrlBuilder: IdentityUrlBuilder
                                        )
  extends Controller with ExecutionContexts with SafeLogging {

  import authenticatedActions._
  import SavedArticleData._

  val page = IdentityPage("/saved-content", "Saved content", "saved-content")

  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest, path: String): String = idUrlBuilder.buildUrl(path, idRequest)


  def saveContentItem = authAction.apply { implicit request =>

    val idRequest = identityRequestParser(request)
    val userId = request.user.getId()

    (idRequest.returnUrl, idRequest.shortUrl) match {
      case (Some(returnUrl), Some(shortUrl)) => {
        val prefsResponse = api.syncedPrefs(request.user.auth)
        savedArticleService.getOrCreateArticlesList(prefsResponse) map {
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

  def listSavedContentItems = authAction.async { implicit request =>

    val prefsResponse = api.syncedPrefs(request.user.auth)
    val idRequest = identityRequestParser(request)

    val form = savedArticeForm.fill(SavedArticleData(List.empty))

    savedArticleService.getOrCreateArticlesList(prefsResponse).map {
      case Right(prefs) =>

        NoCache(Ok(views.html.profile.savedContent(page, form, prefs.articles.asInstanceOf[List[FrontendSavedArticle]].reverse, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
      case Left(errors) =>
        NoCache(Ok(views.html.profile.savedContent(page, form, List.empty, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
    }
  }

  def deleteSavedContentItem = authAction.async { implicit request =>
    println("delete article")

    val prefsResponse = api.syncedPrefs(request.user.auth)
    val idRequest = identityRequestParser(request)

    val form = savedArticeForm.fill(SavedArticleData(List.empty))

    val articles = List[FrontendSavedArticle]()

    /*
    savedArticleService.getOrCreateArticlesList(prefsResponse).map {
      case Right(prefs) =>
        val articles = prefs.frontendArticles.reverse
        */
        savedArticeForm.bindFromRequest.fold(
          {
            case formWithErrors: Form[SavedArticleData] => Future.successful(formWithErrors)
          }, {
            case savedArticleData: SavedArticleData =>
              val form = savedArticeForm.fill(savedArticleData)
              form
          }).map {
          case form =>
            NoCache(Ok(views.html.profile.savedContent(page, form, articles, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
        }

      /*
      case Left(errors) =>
        val formWithErrors = errors.foldLeft(form) {
          case(formWithErrors, Error(_, description, _, context)) =>
            formWithErrors.withError(context.getOrElse(""),  description)
        }
        NoCache(Ok(views.html.profile.savedContent(page, form, List.empty, formActionUrl(idUrlBuilder, idRequest, "/prefs/saved-content/delete"))))
       */
  //  }
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

