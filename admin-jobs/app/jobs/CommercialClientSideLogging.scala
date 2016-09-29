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
  def writeReportsToLog(fromTime: DateTime, duration: Duration): Unit = {
    val toTime = fromTime.plus(duration)
    val timestamps: List[DateTime] = Iterator.iterate(fromTime)(_.plus(step)).takeWhile(!_.isAfter(toTime)).toList
    timestamps.foreach(timestamp => {
      for {
        report <- ClientSideLogging.getReports(timestamp)
      }{
        commercialLogger.info(report)
      }
    })
  }
}

class CommercialClientSideLoggingLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync)(implicit ec: ExecutionContext) extends LifecycleComponent with ExecutionContexts with Logging {

  appLifecycle.addStopHook { () => Future {
    jobs.deschedule("CommercialClientSideLoggingJob")
  }}

  private val jobFrequency = 180.seconds // 3 minutes between each log write

  override def start(): Unit = {
    jobs.deschedule("CommercialClientSideLoggingJob")

    jobs.scheduleEveryNMinutes("CommercialClientSideLoggingJob", 1) {
      run(akkaAsync)
    }
  }

  def run(akkaAsync: AkkaAsync): Future[Unit] = Future {
    akkaAsync.after1s {
      val timeStart = DateTime.now.minusSeconds(jobFrequency.toSeconds.toInt * 2)
      log.logger.info(s"Fetching commercial performance logs from Redis for time period ${timeStart.toString("yyyy-MM-dd'T'HH:mm")}")
      CommercialClientSideLogging.writeReportsToLog(timeStart, new Duration(jobFrequency.toMillis))
    }
  }
}
