package controllers

import com.google.inject.Inject
import common.ExecutionContexts
import idapiclient.IdApiClient
import play.api.mvc._
import actions.AuthenticatedActions
import services.{IdRequestParser, ReturnUrlVerifier}
import utils.SafeLogging

class SaveContentController @Inject() ( api: IdApiClient,
                                        identityRequestParser: IdRequestParser,
                                        authenticatedActions: AuthenticatedActions,
                                        returnUrlVerifier: ReturnUrlVerifier)
  extends Controller with ExecutionContexts with SafeLogging {

  import authenticatedActions.authAction

//  def saveContentItem(userId: String) = authAction.apply { implicit request =>
  def saveContentItem(userId: String) = authAction.apply { implicit request =>


    val idRequest = identityRequestParser(request)
    val userId = request.user.getId()

    println("+++ Saving Content Item " + request.user.auth)
    (idRequest.returnUrl, idRequest.shortUrl) match {
      case (Some(returnUrl), Some(shortUrl) ) =>
       println("We got params")
        api.syncedPrefs(userId, request.user.auth) map { prefs =>
             println("we got success prfs")
            prefs.right map { syncedPrefs =>
              println("we sincd got success prfs")
              if ( !syncedPrefs.contains(shortUrl) ) {
                println("new article **%s**%s**".format(returnUrl, shortUrl))
                val savedArticles = syncedPrefs.addArticle(returnUrl, shortUrl)
                api.saveArticle(userId, request.user.auth, savedArticles)
              }
            }
        }
        SeeOther(returnUrl)
      case _ =>
        logger.info("Could not get verified return url")
        SeeOther(returnUrlVerifier.defaultReturnUrl)
    }
  }


}
