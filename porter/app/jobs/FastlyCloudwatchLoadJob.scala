package jobs

import common.Logging
import services.{ CloudWatch, Fastly }
import scala.concurrent.Await
import scala.concurrent.duration._
import scala.collection.mutable
import conf.Configuration
import org.joda.time.DateTime

object FastlyCloudwatchLoadJob extends Logging {
  // Samples in CloudWatch are additive so we want to limit duplicate reporting.
  // We do not want to corrupt the past either, so set a default value (the most
  // recent 15 minutes of results are unstable).
  val latestTimestampsSent = mutable.Map[(String, String, String), Long]().
    withDefaultValue(DateTime.now().minusMinutes(15).getMillis())

  def run() {
    log.info("Loading statistics from Fastly to CloudWatch.")
    val statistics = Await.result(Fastly(), 1.minute)

    val fresh = statistics filter { statistic =>
      latestTimestampsSent(statistic.key) < statistic.timestamp
    }

    log.info("Uploading %d new metric data points" format fresh.size)
    Configuration.environment.stage.toUpperCase match {
      case "PROD" => CloudWatch.put("Fastly", fresh)
      case _ => log.info("DISABLED: Metrics uploaded in PROD only to limit duplication.")
    }

    val groups = fresh groupBy { _.key }
    val timestampsSent = groups mapValues { _ map { _.timestamp } }
    timestampsSent mapValues { _.max } foreach { case (key, value) =>
      latestTimestampsSent.update(key, value)
    }
  }
}