package controllers

import java.net.URL

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import client.Error
import com.google.inject.Inject
import com.gu.identity.model.SavedArticle
import common.ExecutionContexts
import idapiclient.IdApiClient
import model.{ IdentityPage, NoCache}
import play.api.data.{Forms, Form}
import com.google.inject.Inject
import common.ExecutionContexts
import idapiclient.IdApiClient
import model.{IdentityPage, NoCache}
import play.api.mvc._
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

  import SavedArticleData._

  val page = IdentityPage("/saved-content", "Saved content", "saved-content")

  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest, path: String): String = idUrlBuilder.buildUrl(path, idRequest)


  def saveContentItem = authenticatedActions.authAction.apply { implicit request =>

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


  def listSavedContentItems = authenticatedActions.authAction.async { implicit request  =>

    val prefsResponse = api.syncedPrefs(request.user.auth)

    savedArticleService.getOrCreateArticlesList(prefsResponse).map {
      case Right(prefs) =>
        NoCache(Ok(views.html.profile.savedContent(page, prefs.articles.reverse)))
      case Left(errors) =>
        NoCache(Ok(views.html.profile.savedContent(page, List.empty)))
    }
  }

  def deleteSavedContentItem = authenticatedActions.authAction.apply { implicit request =>
    println("delete article")

    val prefsResponse = api.syncedPrefs(request.user.auth)
    val idRequest = identityRequestParser(request)

    val form = savedArticeForm.fill(SavedArticleData(List.empty))

    val articles = List[SavedArticle]()

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

