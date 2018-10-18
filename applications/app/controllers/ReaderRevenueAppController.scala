package controllers

import common.{ImplicitControllerExecutionContext, Logging}
import model._
import play.api.mvc._
import services.S3

import scala.concurrent.duration._
import conf.Configuration.readerRevenue._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}


class ReaderRevenueAppController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with Logging {


  private def getContributionsBannerDeployLog: Option[String] = {
    S3.get(contributionsBannerDeployLogKey)
  }

  private def bannerDeployLogUnavailable(implicit request: RequestHeader) = {
    log.warn(s"Could not get reader revenue contributions-banner deploy log from s3")
    Cached(300)(WithoutRevalidationResult(NotFound))
  }

  def contributionsBannerDeployLog(): Action[AnyContent] = Action { implicit request =>
    getContributionsBannerDeployLog.fold(bannerDeployLogUnavailable){ bannerDeployLog =>
      Cached(7.days) {
        RevalidatableResult.Ok(bannerDeployLog)
      }
    }
  }

}
