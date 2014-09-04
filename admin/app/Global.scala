import commercial.TravelOffersCacheJob
import common.{AkkaAsync, CloudWatchApplicationMetrics, Jobs}
import conf.{Configuration, Gzipper}
import dfp.DfpDataCacheLifecycle
import jobs.{OmnitureReportJob, RebuildIndexJob, RefreshFrontsJob}
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.Play
import play.api.Play.current
import play.api.mvc.{RequestHeader, Results, WithFilters}

import scala.concurrent.Future

object Global
  extends WithFilters(Gzipper)
  with AdminLifecycle
  with CloudWatchApplicationMetrics
  with Results
  with SurgingContentAgentLifecycle
  with DfpDataCacheLifecycle {

  override lazy val applicationName = "frontend-admin"

  val adminPressJobPushRateInMinutes: Int = Configuration.faciatool.adminPressJobPushRateInMinutes

  val adminRebuildIndexRateInMinutes: Int = Configuration.indexes.adminRebuildIndexRateInMinutes

  override def onError(request: RequestHeader, ex: Throwable) = Future.successful(InternalServerError(
    views.html.errorPage(ex)
  ))

  def scheduleJobs() {
    //Every 3 minutes
    Jobs.schedule("FrontPressJob", s"0 0/$adminPressJobPushRateInMinutes * 1/1 * ? *") {
      RefreshFrontsJob.run()
    }

    Jobs.schedule("RebuildIndexJob", s"0 0/$adminRebuildIndexRateInMinutes * 1/1 * ? *") {
      RebuildIndexJob.run()
    }

    // every 30 minutes
    Jobs.schedule("TravelOffersCacheJob", "0 1/30 * * * ? *") {
      TravelOffersCacheJob.run()
    }

    Jobs.schedule("OmnitureReportJob", "0 */5 * * * ?") {
      OmnitureReportJob.run()
    }
  }

  def descheduleJobs() {
    Jobs.deschedule("FrontPressJob")
    Jobs.deschedule("TravelOffersCacheJob")
    Jobs.deschedule("RebuildIndexJob")
    Jobs.deschedule("OmnitureReportJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)

    if (!Play.isTest) {
      descheduleJobs()
      scheduleJobs()

      AkkaAsync {
        RebuildIndexJob.run()
        TravelOffersCacheJob.run()
        OmnitureReportJob.run()
      }
    }
  }

  override def onStop(app: play.api.Application) {
    if (!Play.isTest) {
      descheduleJobs()
    }

    super.onStop(app)
  }
}
