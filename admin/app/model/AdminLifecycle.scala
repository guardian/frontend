package model

import java.util.TimeZone
import java.nio.file.Files.deleteIfExists

import app.LifecycleComponent
import common._
import conf.Configuration
import conf.switches.Switches._
import _root_.jobs._
import play.api.inject.ApplicationLifecycle
import services.EmailService
import tools.{AssetMetricsCache, CloudWatch, LoadBalancer}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import conf.AdminConfiguration

class AdminLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    emailService: EmailService,
    r2PagePressJob: R2PagePressJob,
    analyticsSanityCheckJob: AnalyticsSanityCheckJob,
    rebuildIndexJob: RebuildIndexJob,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent
    with GuLogging {

  appLifecycle.addStopHook { () =>
    Future {
      descheduleJobs()
      CloudWatch.shutdown()
      emailService.shutdown()
      // deleteTmpFiles()
    }
  }

  lazy val adminPressJobStandardPushRateInMinutes: Int = Configuration.faciatool.adminPressJobStandardPushRateInMinutes
  lazy val adminPressJobHighPushRateInMinutes: Int = Configuration.faciatool.adminPressJobHighPushRateInMinutes
  lazy val adminPressJobLowPushRateInMinutes: Int = Configuration.faciatool.adminPressJobLowPushRateInMinutes
  lazy val adminRebuildIndexRateInMinutes: Int = Configuration.indexes.adminRebuildIndexRateInMinutes
  lazy val r2PagePressRateInSeconds: Int = Configuration.r2Press.pressRateInSeconds

  private def scheduleJobs(): Unit = {

    // every 0, 30 seconds past the minute
    jobs.schedule("AdminLoadJob", "0/30 * * * * ?") {
      model.abtests.AbTestJob.run()
    }

    // every 4, 19, 34, 49 minutes past the hour, on the 2nd second past the minute (e.g 13:04:02, 13:19:02)
    jobs.schedule("LoadBalancerLoadJob", "2 4/15 * * * ?") {
      LoadBalancer.refresh()
    }

    jobs.scheduleEvery("R2PagePressJob", r2PagePressRateInSeconds.seconds) {
      r2PagePressJob.run()
    }

    // every 2, 17, 32, 47 minutes past the hour, on the 12th second past the minute (e.g 13:02:12, 13:17:12)
    jobs.schedule("AnalyticsSanityCheckJob", "12 2/15 * * * ?") {
      analyticsSanityCheckJob.run()
    }

    jobs.scheduleEveryNMinutes("FrontPressJobHighFrequency", adminPressJobHighPushRateInMinutes) {
      if (FrontPressJobSwitch.isSwitchedOn) RefreshFrontsJob.runFrequency(pekkoAsync)(HighFrequency)
      Future.successful(())
    }

    jobs.scheduleEveryNMinutes("FrontPressJobStandardFrequency", adminPressJobStandardPushRateInMinutes) {
      if (FrontPressJobSwitchStandardFrequency.isSwitchedOn)
        RefreshFrontsJob.runFrequency(pekkoAsync)(StandardFrequency)
      Future.successful(())
    }

    jobs.scheduleEveryNMinutes("FrontPressJobLowFrequency", adminPressJobLowPushRateInMinutes) {
      if (FrontPressJobSwitch.isSwitchedOn) RefreshFrontsJob.runFrequency(pekkoAsync)(LowFrequency)
      Future.successful(())
    }
    // every 2, 17, 32, 47 minutes past the hour, on the 9th second past the minute (e.g 13:02:09, 13:17:09)
    jobs.schedule("RebuildIndexJob", s"9 0/$adminRebuildIndexRateInMinutes * 1/1 * ? *") {
      rebuildIndexJob.run()
    }

    val londonTime = TimeZone.getTimeZone("Europe/London")
    jobs.scheduleWeekdayJob("ExpiringSwitchesEmailJob", 48, 8, londonTime) {
      log.info("Starting ExpiringSwitchesEmailJob")
      ExpiringSwitchesEmailJob(emailService).run()
    }

    jobs.scheduleWeekdayJob("ExpiringSwitchesAfternoonEmailJob", 48, 15, londonTime) {
      log.info("Starting ExpiringSwitchesAfternoonEmailJob")
      ExpiringSwitchesEmailJob(emailService).runReminder()
    }

    // TEMP: More frequent CODE trigger for SES v2 verification
    if (conf.Configuration.environment.isNonProd) {
      jobs.schedule("ExpiringSwitchesEmailJobVerification", "0 0/5 * * * ?") { // every 5 minutes
        log.info("Starting ExpiringSwitchesEmailJobVerification (CODE only)")
        ExpiringSwitchesEmailJob(emailService).run()
      }
    }

    jobs.scheduleEveryNMinutes("AssetMetricsCache", 60 * 6) {
      AssetMetricsCache.run()
    }

  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("AdminLoadJob")
    jobs.deschedule("LoadBalancerLoadJob")
    jobs.deschedule("R2PagePressJob")
    jobs.deschedule("AnalyticsSanityCheckJob")
    jobs.deschedule("RebuildIndexJob")
    jobs.deschedule("FrontPressJobHighFrequency")
    jobs.deschedule("FrontPressJobStandardFrequency")
    jobs.deschedule("FrontPressJobLowFrequency")
    jobs.deschedule("ExpiringSwitchesEmailJob")
    jobs.deschedule("ExpiringSwitchesAfternoonEmailJob")
    jobs.deschedule("ExpiringSwitchesEmailJobVerification")
    jobs.deschedule("AssetMetricsCache")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    pekkoAsync.after1s {
      rebuildIndexJob.run()
      AssetMetricsCache.run()
      LoadBalancer.refresh()
    }
  }
}
