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
import purge.CdnPurge

import scala.util.Try

class ReaderRevenueAdminController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)

   extends BaseController with Logging with ImplicitControllerExecutionContext {

  def renderReaderRevenueMenu(): Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.readerRevenue.readerRevenueMenu()))
  }

  def renderContributionsBannerAdmin: Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.readerRevenue.bannerDeploys()))
  }

  def redeployContributionsBanner: Action[AnyContent] = Action { implicit request =>
    val requester: String = UserIdentity.fromRequest(request) map(_.fullName) getOrElse "unknown user (dev-build?)"
    val time = DateTime.now
    val jsonLog: JsValue = Json.toJson(ContributionsBannerDeploy(time))
    val message = s"Contributions banner redeploy by $requester at ${time.toString}}"

    Try(updateContributionsBannerDeployLog(jsonLog.toString)).fold( _ => updateFailed(message, "failed to upload timestamp to s3") , _ => updateSuccessful(message))
  }

  private def updateContributionsBannerDeployLog(bannerDeployLogJson: String): Unit = {
    val defaultJsonEncoding: String = "application/json;charset=utf-8"
    S3.putPublic(contributionsBannerDeployLogKey, bannerDeployLogJson, defaultJsonEncoding)
  }

  private def updateSuccessful(message: String): Result = {
    new CdnPurge(wsClient)
      .soft(DigestUtils.md5Hex(urlToDecache.getPath)).map(_ => bannerRedploySuccessful(message))
      .recover { case e => updateFailed(message, "cache purge request failed") }
      .map(_).getOrElse(updateFailed(message, "cache purge didn't happen"))
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
