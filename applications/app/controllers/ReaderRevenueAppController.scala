package controllers

import common.{ImplicitControllerExecutionContext, Logging}
import model._
import play.api.mvc._
import services.S3

import scala.concurrent.duration._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.readerRevenue.ReaderRevenueRegion
import model.readerRevenue._

class ReaderRevenueAppController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with Logging {

  private[this] def getBannerDeployLog(strRegion: String, bannerType: BannerType): Option[String] = {
    ReaderRevenueRegion.fromName(strRegion).fold(Option.empty[String]) { region: ReaderRevenueRegion =>
      S3.get(ReaderRevenueRegion.getBucketKey(region, bannerType))
    }
  }

  private[this] def bannerDeployLogUnavailable(bannerType: BannerType)(implicit request: RequestHeader) = {
    log.warn(s"Could not get reader revenue ${bannerType.name} deploy log from s3")
    Cached(300)(WithoutRevalidationResult(NotFound))
  }

  private[this] def bannerDeployLogUtil(region: String, bannerType: BannerType): Action[AnyContent] =
    Action { implicit request =>
      getBannerDeployLog(region, bannerType).fold(bannerDeployLogUnavailable(bannerType)) { bannerDeployLog =>
        Cached(7.days) {
          RevalidatableResult.Ok(bannerDeployLog)
        }
      }
    }

  def contributionsBannerDeployLog(region: String): Action[AnyContent] =
    bannerDeployLogUtil(region, ContributionsBanner)

  def subscriptionsBannerDeployLog(region: String): Action[AnyContent] =
    bannerDeployLogUtil(region, SubscriptionsBanner)

}
