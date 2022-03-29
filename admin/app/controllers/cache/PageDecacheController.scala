package controllers.cache

import java.net.URI
import com.gu.googleauth.UserIdentity
import common.{GuLogging, ImplicitControllerExecutionContext}
import controllers.admin.AdminAuthController
import model.{ApplicationContext, NoCache}
import org.apache.commons.codec.digest.DigestUtils
import play.api.http.HttpConfiguration
import play.api.libs.ws.WSClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._
import purge.{AjaxHost, CdnPurge, FastlyService, GuardianHost}

import scala.concurrent.Future
import scala.concurrent.Future.successful

case class PrePurgeTestResult(url: String, passed: Boolean)

class PageDecacheController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    val httpConfiguration: HttpConfiguration,
)(implicit
    context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext
    with AdminAuthController {

  def renderPageDecache(): Action[AnyContent] =
    Action.async { implicit request =>
      Future(NoCache(Ok(views.html.cache.pageDecache())))
    }

  def renderAjaxDecache(): Action[AnyContent] =
    Action.async { implicit request =>
      Future(NoCache(Ok(views.html.cache.ajaxDecache())))
    }

  def decacheAjax(): Action[AnyContent] =
    AdminAuthAction(httpConfiguration).async { implicit request =>
      getSubmittedUrlPathMd5(request) match {
        case Some(path) =>
          CdnPurge.soft(wsClient, path, AjaxHost).map(message => NoCache(Ok(views.html.cache.ajaxDecache(message))))
        case None => successful(BadRequest("No page submitted"))
      }
    }

  def decachePage(): Action[AnyContent] =
    AdminAuthAction(httpConfiguration).async { implicit request =>
      getSubmittedUrlPathMd5(request) match {
        case Some(md5Path) =>
          CdnPurge
            .soft(wsClient, md5Path, GuardianHost)
            .map(message => NoCache(Ok(views.html.cache.pageDecache(message))))
        case None => successful(BadRequest("No page submitted"))
      }
    }

  private def getSubmittedUrlPathMd5(request: AuthenticatedRequest[AnyContent, UserIdentity]): Option[String] = {
    request.body.asFormUrlEncoded
      .getOrElse(Map.empty)
      .get("url")
      .flatMap(_.headOption)
      .map(_.trim)
      .map(url => DigestUtils.md5Hex(new URI(url).getPath))
  }

}
