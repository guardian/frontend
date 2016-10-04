package jobs

import java.io.File

import app.LifecycleComponent
import common._
import common.commercial.ClientSideLogging
import org.apache.commons.io.FileUtils
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
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
  private val loggingJobFrequency = new Duration(5.minutes.toMillis)

  override def start(): Unit = {
    jobs.deschedule("CommercialClientSideLoggingJob")
    jobs.deschedule("CommercialClientSideUploadJob")

    // 5 minutes between each log write.
    jobs.scheduleEveryNMinutes("CommercialClientSideLoggingJob", 5) {
      writeReportsFromRedis(akkaAsync)
    }

    // 15 minutes between each log upload.
    jobs.scheduleEveryNMinutes("CommercialClientSideUploadJob", 15) {
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

  private val loggingDirectory = new File("logs/frontend-commercial-client-side-archive")
  private val dateFormatter: DateTimeFormatter = DateTimeFormat.forPattern("YYYY-MM-dd HH-mm")

  private def uploadReports(akkaAgent: AkkaAsync): Future[Unit] = Future {
    akkaAsync.after1s {
      if (mvt.CommercialClientLoggingVariant.switch.isSwitchedOn && loggingDirectory.exists) {
        val date = DateTime.now
        val formattedDate = dateFormatter.print(date)
        log.logger.info(s"Uploading commercial performance logs to S3 for period $formattedDate")

        val outputFile = new File(formattedDate)
        outputFile.createNewFile()

        for { logFile <- loggingDirectory.listFiles() } {
          val fileContents = FileUtils.readFileToString(logFile)
          FileUtils.write(outputFile, fileContents, true)
        }

        S3CommercialReports.putPublic(s"date=${date.toString("yyyy-MM-dd")}/$formattedDate", outputFile, "text/plain")

        log.logger.info(s"Uploaded ${outputFile.getAbsolutePath} to ${S3CommercialReports.bucket}")

        FileUtils.deleteQuietly(outputFile)

      } else {
        log.logger.info(s"Log Upload Job skipped, logging switch is turned off.")
      }
    }
  }
}

object S3CommercialReports extends S3 {
  override lazy val bucket = "ophan-raw-client-side-ad-metrics"
}
