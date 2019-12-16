package controllers

import common.{ImplicitControllerExecutionContext, Logging}
import model._
import play.api.mvc._
import services.S3

import scala.concurrent.duration._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.readerRevenue.ReaderRevenueRegion
import model.readerRevenue.SubscriptionsBanner


class ReaderRevenueAppController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with Logging {

  private def getContributionsBannerDeployLog(strRegion: String): Option[String] = {
    ReaderRevenueRegion.fromString(strRegion).fold(Option.empty[String]){ region: ReaderRevenueRegion =>
      S3.get(ReaderRevenueRegion.getBucketKey(region))
    }
  }

  private def getBannerDeployLog(strRegion: String): Option[String] = {
    ReaderRevenueRegion.fromString(strRegion).fold(Option.empty[String]){ region: ReaderRevenueRegion =>
      S3.get(ReaderRevenueRegion.getNewBucketKey(region, SubscriptionsBanner))
    }
  }

  private def bannerDeployLogUnavailable(implicit request: RequestHeader) = {
    log.warn(s"Could not get reader revenue contributions-banner deploy log from s3")
    Cached(300)(WithoutRevalidationResult(NotFound))
  }

  def contributionsBannerDeployLog(region: String): Action[AnyContent] = Action { implicit request =>
    getContributionsBannerDeployLog(region).fold(bannerDeployLogUnavailable){ bannerDeployLog =>
      Cached(7.days) {
        RevalidatableResult.Ok(bannerDeployLog)
      }
    }
  }

  def subscriptionsBannerDeployLog(region: String): Action[AnyContent] = Action { implicit request =>
    getBannerDeployLog(region).fold(bannerDeployLogUnavailable) { bannerDeployLog =>
      Cached(7.days) {
        RevalidatableResult.Ok(bannerDeployLog)
      }
    }
  }



}
