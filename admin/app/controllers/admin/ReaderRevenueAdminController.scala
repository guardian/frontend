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
import play.api.libs.ws.{WSClient, WSResponse}
import purge.CdnPurge

import scala.concurrent.Future

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

   val result = for {
      _ <- updateContributionsBannerDeployLog(jsonLog.toString)
      _ <- purgeDeployLogCache()
    } yield bannerRedeploySuccessful(message)

    result.recover { case e => redeployFailed(e)}
  }

  private def updateContributionsBannerDeployLog(bannerDeployLogJson: String): Future[Unit] = {
    val defaultJsonEncoding: String = "application/json;charset=utf-8"
    Future(S3.putPublic(contributionsBannerDeployLogKey, bannerDeployLogJson, defaultJsonEncoding))
  }

  private def purgeDeployLogCache(): Future[WSResponse] = {
    val path = "/reader-revenue/contributions-banner-deploy-log"
    CdnPurge.soft(wsClient, DigestUtils.md5Hex(path))
  }

  private def bannerRedeploySuccessful(message: String): Result = {
    log.info(s"$message: SUCCESSFUL")
    Redirect(routes.ReaderRevenueAdminController.renderContributionsBannerAdmin()).flashing(
      "success" -> ("Banner redeployed"))
  }

  private def redeployFailed(error: Throwable): Result = {
    log.error("Contributions banner redeploy FAILED", error)
    Redirect(routes.ReaderRevenueAdminController.renderContributionsBannerAdmin()).flashing(
    "error" -> ("Banner not redeployed"))
  }


}
