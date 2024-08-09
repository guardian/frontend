package controllers.cache

import java.net.URI
import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, NoCache}
import org.apache.commons.codec.digest.DigestUtils
import play.api.libs.ws.WSClient
import play.api.mvc._
import purge.{AjaxHost, CdnPurge, GuardianHost, LabsHost}

import scala.concurrent.Future
import scala.concurrent.Future.successful

class PageDecacheController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit
    context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderPageDecache(): Action[AnyContent] =
    Action.async { implicit request =>
      Future(NoCache(Ok(views.html.cache.pageDecache())))
    }

  def renderAjaxDecache(): Action[AnyContent] =
    Action.async { implicit request =>
      Future(NoCache(Ok(views.html.cache.ajaxDecache())))
    }

  def renderLabsPageDecache(): Action[AnyContent] =
    Action.async { implicit request =>
      Future(NoCache(Ok(views.html.cache.labsPageDecache())))
    }

  def decacheAjax(): Action[AnyContent] =
    Action.async { implicit request =>
      getSubmittedUrlPathMd5(request) match {
        case Some(path) =>
          CdnPurge.soft(wsClient, path, AjaxHost).map(message => NoCache(Ok(views.html.cache.ajaxDecache(message))))
        case None => successful(BadRequest("No page submitted"))
      }
    }

  def decachePage(): Action[AnyContent] =
    Action.async { implicit request =>
      getSubmittedUrlPathMd5(request) match {
        case Some(md5Path) =>
          CdnPurge
            .soft(wsClient, md5Path, GuardianHost)
            .map(message => NoCache(Ok(views.html.cache.pageDecache(message))))
        case None => successful(BadRequest("No page submitted"))
      }
    }

  def decacheLabsPage(): Action[AnyContent] =
    Action.async { implicit request =>
      getSubmittedUrlPathMd5(request) match {
        case Some(md5Path) =>
          CdnPurge
            .soft(wsClient, md5Path, LabsHost)
            .map(message => NoCache(Ok(views.html.cache.labsPageDecache(message))))
        case None => successful(BadRequest("No page submitted"))
      }
    }

  private def getSubmittedUrlPathMd5(request: Request[AnyContent]): Option[String] = {
    request.body.asFormUrlEncoded
      .getOrElse(Map.empty)
      .get("url")
      .flatMap(_.headOption)
      .map(_.trim)
      .map(new URI(_))
      .map(_.getPath)
      .map(DigestUtils.md5Hex)
  }

}
