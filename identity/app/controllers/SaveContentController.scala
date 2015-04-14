package controllers

import java.net.URI

import com.google.inject.Inject
import common.ExecutionContexts
import idapiclient.IdApiClient
import play.api.mvc._
import actions.AuthenticatedActions
import services.{PlaySavedArticlesService, IdRequestParser, ReturnUrlVerifier}
import utils.SafeLogging

class SaveContentController @Inject() ( api: IdApiClient,
                                        identityRequestParser: IdRequestParser,
                                        authenticatedActions: AuthenticatedActions,
                                        returnUrlVerifier: ReturnUrlVerifier,
                                        savedArticleService: PlaySavedArticlesService
                                        )
  extends Controller with ExecutionContexts with SafeLogging {

  import authenticatedActions.authAction

  def saveContentItem = authAction.apply { implicit request =>

    val idRequest = identityRequestParser(request)
    val userId = request.user.getId()

    (idRequest.returnUrl, idRequest.shortUrl, idRequest.pageId) match {
      case (Some(returnUrl), Some(shortUrl), Some(pageId) ) => {
        val prefsResponse = api.syncedPrefs(request.user.auth)
        savedArticleService.getOrCreateArticlesList(prefsResponse) map {
          case Right(prefs) =>
            if (!prefs.contains(shortUrl)) {
              val savedArticles = prefs.addArticle(pageId, shortUrl)
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

}
