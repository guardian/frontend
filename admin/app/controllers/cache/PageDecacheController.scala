package controllers.cache

import java.net.{URI, URL}

import cache.SurrogateKey
import com.gu.googleauth.UserIdentity
import common.{ExecutionContexts, Logging}
import controllers.admin.AuthActions
import model.{ApplicationContext, NoCache}
import play.api.libs.ws.WSClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._
import purge.CdnPurge
import scala.concurrent.Future
import scala.concurrent.Future.successful

case class PrePurgeTestResult(url: String, passed: Boolean)

class PageDecacheController(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController with Logging with ExecutionContexts {

  val authActions = new AuthActions(wsClient, controllerComponents)

  def renderPageDecache() = Action.async { implicit request =>
      Future(NoCache(Ok(views.html.cache.pageDecache())))
  }

  def decache() = authActions.AuthActionTest.async { implicit request =>
    getSubmittedUrl(request).map(new URI(_)).map{ urlToDecache =>
      new CdnPurge(wsClient)
        .soft(SurrogateKey(urlToDecache.getPath))
        .map { _ => "Purge request successfully sent" }
        .recover { case e => s"Purge request was not successful, please report this issue: '${e.getLocalizedMessage}'" }
        .map { message => NoCache(Ok(views.html.cache.pageDecache(message))) }
    }.getOrElse(successful(BadRequest("No page submitted")))
  }

  private def getSubmittedUrl(request: AuthenticatedRequest[AnyContent, UserIdentity]): Option[String] =
    request
      .body.asFormUrlEncoded
      .getOrElse(Map.empty)
      .get("url")
      .flatMap(_.headOption)
      .map(_.trim)

}
