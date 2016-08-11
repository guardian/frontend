package controllers.cache

import java.net.URI

import cache.SurrogateKey
import com.gu.googleauth.UserIdentity
import common.{ExecutionContexts, Logging}
import controllers.admin.AuthActions
import model.NoCache
import play.api.libs.ws.WSClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc.{Action, AnyContent, Controller}
import purge.CdnPurge

import scala.concurrent.Future.successful

class PageDecacheController(wsClient: WSClient) extends Controller with Logging with ExecutionContexts {

  def renderPageDecacheForm() = Action { implicit request =>
    NoCache(Ok(views.html.cache.pageDecacheForm()))
  }

  def decache() = AuthActions.AuthActionTest.async { implicit request =>
    getSubmittedUrl(request).map(new URI(_)).map{ urlToDecache =>

      new CdnPurge(wsClient).hard(SurrogateKey(urlToDecache.getPath))
      successful(NoCache(Ok(views.html.cache.pageDecacheForm())))
    }.getOrElse(successful(BadRequest("No image submitted")))

  }

  private def getSubmittedUrl(request: AuthenticatedRequest[AnyContent, UserIdentity]): Option[String] = request
    .body.asFormUrlEncoded
    .getOrElse(Map.empty)
    .get("url")
    .flatMap(_.headOption)
    .map(_.trim)

}
