package controllers.cache

import java.net.URI

import com.gu.googleauth.UserIdentity
import common.{ImplicitControllerExecutionContext, Logging}
import controllers.admin.AdminAuthController
import model.{ApplicationContext, NoCache}
import org.apache.commons.codec.digest.DigestUtils
import play.api.libs.ws.WSClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._
import purge.CdnPurge

import scala.concurrent.Future
import scala.concurrent.Future.successful

case class PrePurgeTestResult(url: String, passed: Boolean)

class PageDecacheController(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with Logging with ImplicitControllerExecutionContext with AdminAuthController {

  def renderPageDecache(): Action[AnyContent] = Action.async { implicit request =>
      Future(NoCache(Ok(views.html.cache.pageDecache())))
  }

  def decache(): Action[AnyContent] = AdminAuthAction.async { implicit request =>
    getSubmittedUrl(request).map(new URI(_)).map{ urlToDecache =>
      CdnPurge.soft(wsClient, DigestUtils.md5Hex(urlToDecache.getPath), CdnPurge.GuardianHost)
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
