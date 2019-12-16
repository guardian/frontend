package controllers.admin

import com.gu.googleauth.UserIdentity
import common.{ImplicitControllerExecutionContext, Logging}
import model.{ApplicationContext, NoCache}
import model.readerRevenue._
import org.joda.time.DateTime
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._
import services.S3
import org.apache.commons.codec.digest.DigestUtils
import play.api.libs.ws.{WSClient, WSResponse}
import purge.{AjaxHost, CdnPurge}

import scala.concurrent.Future

class ReaderRevenueAdminController(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)

   extends BaseController with Logging with ImplicitControllerExecutionContext {

  def renderReaderRevenueMenu(): Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.readerRevenue.readerRevenueMenu()))
  }

  def renderContributionsBannerAdmin: Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.readerRevenue.bannerDeploys(ReaderRevenueRegion.allRegions)))
  }

  def renderSubscriptionsBannerAdmin: Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.readerRevenue.subscriptionsBannerDeploys(ReaderRevenueRegion.allRegions)))
  }

  def redeployContributionsBanner(region: String): Action[AnyContent] = Action.async { implicit request =>
    ReaderRevenueRegion.fromString(region).fold(Future(redeployFailed(new Throwable("attempted to redeploy banner in unknown region")))){ region: ReaderRevenueRegion =>
      val requester: String = UserIdentity.fromRequest(request) map(_.fullName) getOrElse "unknown user (dev-build?)"
      val time = DateTime.now
      val jsonLog: JsValue = Json.toJson(ContributionsBannerDeploy(time))
      val message = s"Contributions banner in ${region.name} redeploy by $requester at ${time.toString}}"

      val result = for {
        _ <- updateContributionsBannerDeployLog(region, jsonLog.toString)
        _ <- purgeDeployLogCache(region)
      } yield bannerRedeploySuccessful(message, region)

      result.recover { case e => redeployFailed(e)}
    }

  }

  def redeploySubscriptionsBanner(region: String): Action[AnyContent] = redeployBanner(region, SubscriptionsBanner)

  def redeployBanner(region: String, bannerType: BannerType): Action[AnyContent] = Action.async { implicit request =>
    ReaderRevenueRegion.fromString(region).fold(Future(redeployFailed(new Throwable("attempted to redeploy banner in unknown region")))){ region: ReaderRevenueRegion =>
      log.info(s"redeployBanner $bannerType $region")
      val requester: String = UserIdentity.fromRequest(request) map(_.fullName) getOrElse "unknown user (dev-build?)"
      val time = DateTime.now
      val jsonLog: JsValue = Json.toJson(ContributionsBannerDeploy(time))
      val message = s"Subscriptions banner in ${region.name} redeploy by $requester at ${time.toString}}"

      val result = for {
        _ <- updateBannerDeployLog(region, jsonLog.toString, bannerType)
//        _ <- purgeDeployLogCache(region)
      } yield bannerRedeploySuccessful(message, region)

      result.recover { case e => redeployFailed(e) }
    }

  }

  private def updateContributionsBannerDeployLog(region: ReaderRevenueRegion, bannerDeployLogJson: String): Future[Unit] = {
    val defaultJsonEncoding: String = "application/json;charset=utf-8"
    val bucketKey = ReaderRevenueRegion.getBucketKey(region)
    Future(S3.putPublic(bucketKey, bannerDeployLogJson, defaultJsonEncoding))
  }

  private def updateBannerDeployLog(region: ReaderRevenueRegion, bannerDeployLogJson: String, banner: BannerType): Future[Unit] = {
    log.info(s"updateBannerDeployLog $banner $region")
    val defaultJsonEncoding: String = "application/json;charset=utf-8"
    val bucketKey = ReaderRevenueRegion.getNewBucketKey(region, banner)
    Future(S3.putPublic(bucketKey, bannerDeployLogJson, defaultJsonEncoding))
  }

  private def purgeDeployLogCache(region: ReaderRevenueRegion): Future[String] = {
    val path = "/reader-revenue/contributions-banner-deploy-log/" + region.name
    CdnPurge.soft(wsClient, DigestUtils.md5Hex(path), AjaxHost)
  }

  private def bannerRedeploySuccessful(message: String, region: ReaderRevenueRegion): Result = {
    log.info(s"$message: SUCCESSFUL")
    Redirect(routes.ReaderRevenueAdminController.renderContributionsBannerAdmin()).flashing(
      "success" -> (s"Banner redeployed in ${region.name}"))
  }

  private def redeployFailed(error: Throwable): Result = {
    log.error("Contributions banner redeploy FAILED", error)
    Redirect(routes.ReaderRevenueAdminController.renderContributionsBannerAdmin()).flashing(
      "error" -> ("Banner not redeployed"))
  }


}
