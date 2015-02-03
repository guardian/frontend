package model

import commercial.TravelOffersCacheJob
import common.{Logging, AkkaAsync, Jobs}
import conf.Configuration
import conf.Configuration.environment
import football.feed.MatchDayRecorder
import jobs._
import play.api.GlobalSettings
import services.EmailService
import tools.{CloudWatch, LoadBalancer}

trait AdminLifecycle extends GlobalSettings with Logging {

  lazy val adminPressJobStandardPushRateInMinutes: Int = Configuration.faciatool.adminPressJobStandardPushRateInMinutes
  lazy val adminPressJobHighPushRateInMinutes: Int = Configuration.faciatool.adminPressJobHighPushRateInMinutes
  lazy val adminPressJobLowPushRateInMinutes: Int = Configuration.faciatool.adminPressJobLowPushRateInMinutes
  lazy val adminRebuildIndexRateInMinutes: Int = Configuration.indexes.adminRebuildIndexRateInMinutes

  private def scheduleJobs() {
    Jobs.schedule("AdminLoadJob", "0/30 * * * * ?") {
      model.abtests.AbTestJob.run()
    }

    Jobs.schedule("LoadBalancerLoadJob", "* 0/15 * * * ?") {
      LoadBalancer.refresh()
    }

    Jobs.schedule("FastlyCloudwatchLoadJob", "0 0/2 * * * ?") {
      FastlyCloudwatchLoadJob.run()
    }

    Jobs.schedule("AnalyticsSanityCheckJob", "0 0/15 * * * ?") {
      AnalyticsSanityCheckJob.run()
    }

    Jobs.scheduleEveryNMinutes("FrontPressJobHighFrequency", adminPressJobHighPushRateInMinutes) {
      RefreshFrontsJob.runHighFrequency()
    }

    Jobs.scheduleEveryNMinutes("FrontPressJobStandardFrequency", adminPressJobStandardPushRateInMinutes) {
      RefreshFrontsJob.runStandardFrequency()
    }

    Jobs.scheduleEveryNMinutes("FrontPressJobLowFrequency", adminPressJobLowPushRateInMinutes) {
      RefreshFrontsJob.runLowFrequency()
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

    Jobs.schedule("SentryReportJob", "0 */5 * * * ?") {
      SentryReportJob.run()
    }

    Jobs.schedule("MatchDayRecorderJob", "0 * * * * ?") {
      MatchDayRecorder.record()
    }

    if (environment.isProd) {
      Jobs.schedule("AdsStatusEmailJob", "0 44 8 ? * MON-FRI") {
        AdsStatusEmailJob.run()
      }
      Jobs.schedule("ExpiringAdFeaturesEmailJob", "0 47 8 ? * MON-FRI") {
        log.info(s"Starting ExpiringAdFeaturesEmailJob")
        ExpiringAdFeaturesEmailJob.run()
      }
    }

    Jobs.schedule("VideoEncodingsJob", "0 0/15 * * * ?") {
      log.info("Starting VideoEncodingsJob")
      VideoEncodingsJob.run()
    }

  }

  private def descheduleJobs() {
    Jobs.deschedule("AdminLoadJob")
    Jobs.deschedule("LoadBalancerLoadJob")
    Jobs.deschedule("FastlyCloudwatchLoadJob")
    Jobs.deschedule("AnalyticsSanityCheckJob")
    Jobs.deschedule("FrontPressJob")
    Jobs.deschedule("TravelOffersCacheJob")
    Jobs.deschedule("RebuildIndexJob")
    Jobs.deschedule("OmnitureReportJob")
    Jobs.deschedule("MatchDayRecorderJob")
    Jobs.deschedule("SentryReportJob")
    Jobs.deschedule("FrontPressJobHighFrequency")
    Jobs.deschedule("FrontPressJobStandardFrequency")
    Jobs.deschedule("FrontPressJobLowFrequency")
    Jobs.deschedule("AdsStatusEmailJob")
    Jobs.deschedule("ExpiringAdFeaturesEmailJob")
    Jobs.deschedule("VideoEncodingsJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()

    AkkaAsync {
      RebuildIndexJob.run()
      TravelOffersCacheJob.run()
      OmnitureReportJob.run()
      SentryReportJob.run()
      VideoEncodingsJob.run()
    }
  }

  override def onStop(app: play.api.Application) {
    descheduleJobs()
    CloudWatch.shutdown()
    EmailService.shutdown()
    super.onStop(app)
  }
}
