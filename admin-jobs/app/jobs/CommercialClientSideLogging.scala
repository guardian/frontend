package jobs

import app.LifecycleComponent
import common._
import common.commercial.ClientSideLogging
import org.joda.time.{Duration, DateTime}
import org.slf4j.LoggerFactory
import play.api.inject.ApplicationLifecycle
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
  private val jobFrequency = 600.seconds

  override def start(): Unit = {
    jobs.deschedule("CommercialClientSideLoggingJob")

    jobs.scheduleEveryNMinutes("CommercialClientSideLoggingJob", 5) {
      run(akkaAsync)
    }
  }

  def run(akkaAsync: AkkaAsync): Future[Unit] = Future {
    akkaAsync.after1s {
      // Start searching logs by doubling the period, allowing fresh data to settle.
      val timeStart = DateTime.now.minusSeconds(jobFrequency.toSeconds.toInt * 2)
      log.logger.info(s"Fetching commercial performance logs from Redis for time period ${timeStart.toString("yyyy-MM-dd HH:mm")}")
      val numReports = CommercialClientSideLogging.writeReportsToLog(timeStart, new Duration(jobFrequency.toMillis))
      log.logger.info(s"Fetched $numReports logs from Redis.")
    }
  }
}
