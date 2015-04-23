package controllers

import java.net.URL

import actions.AuthenticatedActions
import com.google.inject.Inject
import common.ExecutionContexts
import idapiclient.IdApiClient
import model.{IdentityPage, NoCache}
import play.api.mvc._
import services._
import utils.SafeLogging

class SaveContentController @Inject() ( api: IdApiClient,
                                        identityRequestParser: IdRequestParser,
                                        authenticatedActions: AuthenticatedActions,
                                        returnUrlVerifier: ReturnUrlVerifier,
                                        savedArticleService: PlaySavedArticlesService
                                        )
  extends Controller with ExecutionContexts with SafeLogging {


  val page = IdentityPage("/saved-content", "Saved content", "saved-content")


  def saveContentItem = authenticatedActions.authAction.apply { implicit request =>

    val idRequest = identityRequestParser(request)
    val userId = request.user.getId()

    (idRequest.returnUrl, idRequest.shortUrl) match {
      case (Some(returnUrl), Some(shortUrl) ) => {
        val prefsResponse = api.syncedPrefs(request.user.auth)
        savedArticleService.getOrCreateArticlesList(prefsResponse) map {
          case Right(prefs) =>
            if (!prefs.contains(shortUrl)) {
              val savedArticles = prefs.addArticle(new URL(returnUrl).getPath.drop(1), shortUrl)
              api.saveArticle(userId, request.user.auth, savedArticles)
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
}
