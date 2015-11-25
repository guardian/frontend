package model

import java.util.TimeZone

import common.{AkkaAsync, Jobs, Logging}
import conf.Configuration
import conf.Configuration.environment
import conf.switches.Switches._
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

    //every 0, 30 seconds past the minute
    Jobs.schedule("AdminLoadJob", "0/30 * * * * ?") {
      model.abtests.AbTestJob.run()
    }

    //every 4, 19, 34, 49 minutes past the hour, on the 2nd second past the minute (e.g 13:04:02, 13:19:02)
    Jobs.schedule("LoadBalancerLoadJob", "2 4/15 * * * ?") {
      LoadBalancer.refresh()
    }

    //every 2 minutes starting 5 seconds past the minute (e.g  13:02:05, 13:04:05)
    Jobs.schedule("FastlyCloudwatchLoadJob", "5 0/2 * * * ?") {
      FastlyCloudwatchLoadJob.run()
    }

    //every 2, 17, 32, 47 minutes past the hour, on the 12th second past the minute (e.g 13:02:12, 13:17:12)
    Jobs.schedule("AnalyticsSanityCheckJob", "12 2/15 * * * ?") {
      AnalyticsSanityCheckJob.run()
    }

    Jobs.scheduleEveryNMinutes("FrontPressJobHighFrequency", adminPressJobHighPushRateInMinutes) {
      if(FrontPressJobSwitch.isSwitchedOn) RefreshFrontsJob.runFrequency(HighFrequency)
    }

    Jobs.scheduleEveryNMinutes("FrontPressJobStandardFrequency", adminPressJobStandardPushRateInMinutes) {
      if(FrontPressJobSwitchStandardFrequency.isSwitchedOn) RefreshFrontsJob.runFrequency(StandardFrequency)
    }

    Jobs.scheduleEveryNMinutes("FrontPressJobLowFrequency", adminPressJobLowPushRateInMinutes) {
      if(FrontPressJobSwitch.isSwitchedOn) RefreshFrontsJob.runFrequency(LowFrequency)
    }

    Jobs.schedule("RebuildIndexJob", s"9 0/$adminRebuildIndexRateInMinutes * 1/1 * ? *") {
      RebuildIndexJob.run()
    }

    // every 1, 31 minutes past the hour, 14 seconds past the minute (e.g 13:01:14, 13:31:14)
    Jobs.schedule("TravelOffersCacheJob", "14 1/30 * * * ? *") {
      TravelOffersCacheJob.run()
    }

    // every minute, 22 seconds past the minute (e.g 13:01:22, 13:02:22)
    Jobs.schedule("MatchDayRecorderJob", "22 * * * * ?") {
      MatchDayRecorder.record()
    }

    if (environment.isProd) {
      val londonTime = TimeZone.getTimeZone("Europe/London")
      Jobs.schedule("AdsStatusEmailJob", "0 44 8 ? * MON-FRI", londonTime) {
        AdsStatusEmailJob.run()
      }
      Jobs.schedule("ExpiringAdFeaturesEmailJob", "0 47 8 ? * MON-FRI", londonTime) {
        log.info(s"Starting ExpiringAdFeaturesEmailJob")
        ExpiringAdFeaturesEmailJob.run()
      }
      Jobs.schedule("ExpiringSwitchesEmailJob", "0 48 8 ? * MON-FRI", londonTime) {
        log.info(s"Starting ExpiringSwitchesEmailJob")
        ExpiringSwitchesEmailJob.run()
      }
    }

    //every 7, 22, 37, 52 minutes past the hour, 28 seconds past the minute (e.g 13:07:28, 13:22:28)
    Jobs.schedule("VideoEncodingsJob", "28 7/15 * * * ?") {
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
    Jobs.deschedule("MatchDayRecorderJob")
    Jobs.deschedule("SentryReportJob")
    Jobs.deschedule("FrontPressJobHighFrequency")
    Jobs.deschedule("FrontPressJobStandardFrequency")
    Jobs.deschedule("FrontPressJobLowFrequency")
    Jobs.deschedule("AdsStatusEmailJob")
    Jobs.deschedule("ExpiringAdFeaturesEmailJob")
    Jobs.deschedule("VideoEncodingsJob")
    Jobs.deschedule("ExpiringSwitchesEmailJob")
  }

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    descheduleJobs()
    scheduleJobs()

    AkkaAsync {
      RebuildIndexJob.run()
      TravelOffersCacheJob.run()
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
