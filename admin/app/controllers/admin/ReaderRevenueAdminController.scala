package controllers.admin

import com.gu.googleauth.UserIdentity
import common.{ImplicitControllerExecutionContext, Logging}
import model.{ApplicationContext, NoCache}
import model.readerRevenue.ContributionsBannerDeploy
import org.joda.time.DateTime
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._
import services.S3
import conf.Configuration.readerRevenue._
import org.apache.commons.codec.digest.DigestUtils
import play.api.libs.ws.WSClient
import purge.CdnPurge

import scala.concurrent.Future
import scala.util.Try

class ReaderRevenueAdminController(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)

   extends BaseController with Logging with ImplicitControllerExecutionContext {

  def renderReaderRevenueMenu(): Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.readerRevenue.readerRevenueMenu()))
  }

  def renderContributionsBannerAdmin: Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.readerRevenue.bannerDeploys()))
  }

  def redeployContributionsBanner: Action[AnyContent] = Action.async { implicit request =>
    val requester: String = UserIdentity.fromRequest(request) map(_.fullName) getOrElse "unknown user (dev-build?)"
    val time = DateTime.now
    val jsonLog: JsValue = Json.toJson(ContributionsBannerDeploy(time))
    val message = s"Contributions banner redeploy by $requester at ${time.toString}}"

    Try(updateContributionsBannerDeployLog(jsonLog.toString))
      .fold( e => Future.successful(updateFailed(message, s"upload timestamp to s3: ${e.getLocalizedMessage}")) , _ => updateSuccessful(message))
  }

  private def updateContributionsBannerDeployLog(bannerDeployLogJson: String): Unit = {
    val defaultJsonEncoding: String = "application/json;charset=utf-8"
    S3.putPublic(contributionsBannerDeployLogKey, bannerDeployLogJson, defaultJsonEncoding)
  }

  private def updateSuccessful(message: String): Future[Result] = {
    val path = "reader-revenue/redeploy-contributions-banner"

    new CdnPurge(wsClient)
      .soft(DigestUtils.md5Hex(path))
      .map(_ => bannerRedploySuccessful(message))
      .recover { case e => updateFailed(message, s"cache purge request: ${e.getLocalizedMessage}") }

  }

  private def bannerRedploySuccessful(message: String): Result = {
    log.info(s"$message: SUCCESSFUL")
    Redirect(routes.ReaderRevenueAdminController.renderContributionsBannerAdmin()).flashing(
      "success" -> ("Banner redeployed")
    )

  }

  private def updateFailed(message: String, error: String): Result = {
    log.error(s"$message: FAILED, $error")
    Redirect(routes.ReaderRevenueAdminController.renderContributionsBannerAdmin()).flashing(
    "error" -> ("Banner not redeployed"))

  }


}
