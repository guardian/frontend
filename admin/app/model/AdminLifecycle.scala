package model

import java.util.TimeZone

import common.{LifecycleComponent, AkkaAsync, Jobs, Logging}
import conf.Configuration
import conf.Configuration.environment
import conf.switches.Switches._
import football.feed.MatchDayRecorder
import jobs._
import play.api.inject.ApplicationLifecycle
import services.EmailService
import tools.{AssetMetricsCache, CloudWatch, LoadBalancer}

import scala.concurrent.{ExecutionContext, Future}

class AdminLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent with Logging {

  appLifecycle.addStopHook { () => Future {
    descheduleJobs()
    CloudWatch.shutdown()
    EmailService.shutdown()
  }}

  lazy val adminPressJobStandardPushRateInMinutes: Int = Configuration.faciatool.adminPressJobStandardPushRateInMinutes
  lazy val adminPressJobHighPushRateInMinutes: Int = Configuration.faciatool.adminPressJobHighPushRateInMinutes
  lazy val adminPressJobLowPushRateInMinutes: Int = Configuration.faciatool.adminPressJobLowPushRateInMinutes
  lazy val adminRebuildIndexRateInMinutes: Int = Configuration.indexes.adminRebuildIndexRateInMinutes
  lazy val r2PagePressRateInSeconds: Int = Configuration.r2Press.pressRateInSeconds

  private def scheduleJobs(): Unit = {

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

    Jobs.scheduleEveryNSeconds("R2PagePressJob", r2PagePressRateInSeconds) {
      R2PagePressJob.run()
    }

    //every 2, 17, 32, 47 minutes past the hour, on the 12th second past the minute (e.g 13:02:12, 13:17:12)
    Jobs.schedule("AnalyticsSanityCheckJob", "12 2/15 * * * ?") {
      AnalyticsSanityCheckJob.run()
    }

    Jobs.scheduleEveryNMinutes("FrontPressJobHighFrequency", adminPressJobHighPushRateInMinutes) {
      if(FrontPressJobSwitch.isSwitchedOn) RefreshFrontsJob.runFrequency(HighFrequency)
      Future.successful(())
    }

    Jobs.scheduleEveryNMinutes("FrontPressJobStandardFrequency", adminPressJobStandardPushRateInMinutes) {
      if(FrontPressJobSwitchStandardFrequency.isSwitchedOn) RefreshFrontsJob.runFrequency(StandardFrequency)
      Future.successful(())
    }

    Jobs.scheduleEveryNMinutes("FrontPressJobLowFrequency", adminPressJobLowPushRateInMinutes) {
      if(FrontPressJobSwitch.isSwitchedOn) RefreshFrontsJob.runFrequency(LowFrequency)
      Future.successful(())
    }

    Jobs.schedule("RebuildIndexJob", s"9 0/$adminRebuildIndexRateInMinutes * 1/1 * ? *") {
      RebuildIndexJob.run()
    }

    // every minute, 22 seconds past the minute (e.g 13:01:22, 13:02:22)
    Jobs.schedule("MatchDayRecorderJob", "22 * * * * ?") {
      MatchDayRecorder.record()
    }

    if (environment.isProd) {
      val londonTime = TimeZone.getTimeZone("Europe/London")
      Jobs.scheduleWeekdayJob("AdsStatusEmailJob", 44, 8, londonTime) {
        AdsStatusEmailJob.run()
      }
      Jobs.scheduleWeekdayJob("ExpiringAdFeaturesEmailJob", 47, 8, londonTime) {
        log.info(s"Starting ExpiringAdFeaturesEmailJob")
        ExpiringAdFeaturesEmailJob.run()
      }
      Jobs.scheduleWeekdayJob("ExpiringSwitchesEmailJob", 48, 8, londonTime) {
        log.info(s"Starting ExpiringSwitchesEmailJob")
        ExpiringSwitchesEmailJob.run()
      }
    }

    //every 7, 22, 37, 52 minutes past the hour, 28 seconds past the minute (e.g 13:07:28, 13:22:28)
    Jobs.schedule("VideoEncodingsJob", "28 7/15 * * * ?") {
      log.info("Starting VideoEncodingsJob")
      VideoEncodingsJob.run()
    }

    Jobs.scheduleEveryNMinutes("AssetMetricsCache", 60 * 6) {
      AssetMetricsCache.run()
    }

  }

  private def descheduleJobs(): Unit = {
    Jobs.deschedule("AdminLoadJob")
    Jobs.deschedule("LoadBalancerLoadJob")
    Jobs.deschedule("FastlyCloudwatchLoadJob")
    Jobs.deschedule("R2PagePressJob")
    Jobs.deschedule("AnalyticsSanityCheckJob")
    Jobs.deschedule("FrontPressJob")
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
    Jobs.deschedule("AssetMetricsCache")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    AkkaAsync {
      RebuildIndexJob.run()
      VideoEncodingsJob.run()
      AssetMetricsCache.run()
    }
  }
}
