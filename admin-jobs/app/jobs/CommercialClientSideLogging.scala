package jobs

import app.LifecycleComponent
import common._
import common.commercial.ClientSideLogging
import org.joda.time.{Duration, DateTime}
import org.slf4j.LoggerFactory
import play.api.inject.ApplicationLifecycle
import services.S3
import scala.concurrent.{Future, ExecutionContext}
import scala.concurrent.duration._

object CommercialClientSideLogging extends Logging {

  private val step = new Duration(1000L)
  private lazy val commercialLogger = LoggerFactory.getLogger("jobs.CommercialClientSideLogging")

  // This function takes a date interval, and finds logging data for that range.
  // It then prints this data to log.
  def writeReportsToLog(fromTime: DateTime, duration: Duration): Int = {
    val toTime = fromTime.plus(duration)
    val timestamps: List[DateTime] = Iterator.iterate(fromTime)(_.plus(step)).takeWhile(!_.isAfter(toTime)).toList
    val reports = timestamps.flatMap(timestamp => {
      for {
        report <- ClientSideLogging.getReports(timestamp)
      } yield {
        // Specifically use this logger to make it clear what's happening. These log lines go to a different file,
        // with an hourly rolling policy.
        commercialLogger.info(report)
        report
      }
    })
    timestamps.foreach(ClientSideLogging.cleanUpReports)
    reports.length
  }
}

class CommercialClientSideLoggingLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync)(implicit ec: ExecutionContext) extends LifecycleComponent with ExecutionContexts with Logging {

  appLifecycle.addStopHook { () => Future {
    jobs.deschedule("CommercialClientSideLoggingJob")
  }}

  // 5 minutes between each log write.
  private val loggingJobFrequency = new Duration(5.minutes)


  override def start(): Unit = {
    jobs.deschedule("CommercialClientSideLoggingJob")
    jobs.deschedule("CommercialClientSideUploadJob")

    // 5 minutes between each log write.
    jobs.scheduleEveryNMinutes("CommercialClientSideLoggingJob", 5) {
      writeReportsFromRedis(akkaAsync)
    }

    // 15 minutes between each log upload.
    jobs.scheduleEveryNMinutes("CommercialClientSideLoggingJob", 15) {
      uploadReports(akkaAsync)
    }
  }

  private def writeReportsFromRedis(akkaAsync: AkkaAsync): Future[Unit] = Future {
    akkaAsync.after1s {
      if (mvt.CommercialClientLoggingVariant.switch.isSwitchedOn) {
        // Start searching logs from two periods behind the current time. This allows fresh data to settle.
        val timeStart = DateTime.now.minus(loggingJobFrequency.multipliedBy(2L))
        log.logger.info(s"Fetching commercial performance logs from Redis for time period ${timeStart.toString("yyyy-MM-dd HH:mm")}")
        val numReports = CommercialClientSideLogging.writeReportsToLog(timeStart, loggingJobFrequency)
        log.logger.info(s"Fetched $numReports logs from Redis.")
      } else {
        log.logger.info(s"Logging Job skipped, logging switch is turned off.")
      }
    }
  }

  private def uploadReports(akkaAgent: AkkaAsync): Future[Unit] = Future {
    akkaAsync.after1s {
      if (mvt.CommercialClientLoggingVariant.switch.isSwitchedOn) {

      } else {
        log.logger.info(s"Log Upload Job skipped, logging switch is turned off.")
      }
    }
  }
}

object S3CommercialReports extends S3 {
  override lazy val bucket = "ophan-raw-client-side-ad-metrics"
}
