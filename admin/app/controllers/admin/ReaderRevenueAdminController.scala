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

  def redeployContributionsBanner(region: String): Action[AnyContent] = redeployBanner(region, ContributionsBanner)

  def redeploySubscriptionsBanner(region: String): Action[AnyContent] = redeployBanner(region, SubscriptionsBanner)

  def redeployBanner(region: String, bannerType: BannerType): Action[AnyContent] = Action.async { implicit request =>
    ReaderRevenueRegion.fromName(region).fold(Future.successful(redeployFailed(new Throwable("attempted to redeploy banner in unknown region"), bannerType))){ region: ReaderRevenueRegion =>
      val requester: String = UserIdentity.fromRequest(request) map(_.fullName) getOrElse "unknown user (dev-build?)"
      val millisSinceEpoch = DateTime.now.getMillis()
      val jsonLog: JsValue = Json.toJson(BannerDeploy(millisSinceEpoch))
      val message = s"${bannerType.name} banner in ${region.name} redeploy by $requester at ${millisSinceEpoch.toString}}"

      val result = for {
        _ <- updateBannerDeployLog(region, jsonLog.toString, bannerType)
        _ <- purgeDeployLogCache(region, bannerType)
      } yield bannerRedeploySuccessful(message, region, bannerType)

      result.recover { case e => redeployFailed(e, bannerType) }
    }

  }

  private[this] def updateBannerDeployLog(
    region: ReaderRevenueRegion,
    bannerDeployLogJson: String,
    banner: BannerType
  ): Future[Unit] = {
    log.info(s"updateBannerDeployLog $banner $region")
    val defaultJsonEncoding: String = "application/json;charset=utf-8"
    val bucketKey = ReaderRevenueRegion.getBucketKey(region, banner)
    Future(S3.putPublic(bucketKey, bannerDeployLogJson, defaultJsonEncoding))
  }

  private[this] def purgeDeployLogCache(
    region: ReaderRevenueRegion,
    bannerType: BannerType
  ): Future[String] = {
    val path = s"/reader-revenue${bannerType.path}/${region.name}"
    log.info(s"Attempting to purge Fastly cache from URL: $path")
    CdnPurge.soft(wsClient, DigestUtils.md5Hex(path), AjaxHost)
  }

  private[this] def getRoute(bannerType: BannerType): Call = {
     bannerType match {
      case ContributionsBanner => routes.ReaderRevenueAdminController.renderContributionsBannerAdmin()
      case SubscriptionsBanner => routes.ReaderRevenueAdminController.renderSubscriptionsBannerAdmin()
    }
  }

  private[this] def bannerRedeploySuccessful(message: String, region: ReaderRevenueRegion, bannerType: BannerType): Result = {
    log.info(s"$message: SUCCESSFUL")
    Redirect(getRoute(bannerType)).flashing("success" -> s"${bannerType.name} redeployed in ${region.name}")
  }

  private[this] def redeployFailed(error: Throwable, bannerType: BannerType): Result = {
    log.error(s"${bannerType.name} banner redeploy FAILED", error)
    Redirect(getRoute(bannerType)).flashing("error" -> s"${bannerType.name} not redeployed")
  }
}
