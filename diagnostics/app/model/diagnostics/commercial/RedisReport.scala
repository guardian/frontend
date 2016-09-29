package model.diagnostics.commercial

import common.{ExecutionContexts, Logging}
import common.commercial.ClientSideLogging
import org.joda.time.DateTime
import play.api.libs.json.Json
import services.S3

object S3CommercialReports extends S3 {
  override lazy val bucket = "ophan-raw-client-side-ad-metrics"
}

/*
RedisReport writes commercial performance beacons into Redis as key-values.
When the key expires, the ExpiredKeyEventSubscriber object will be notified.
*/
object RedisReport extends Logging with ExecutionContexts {

  // The number of seconds to wait before triggering the data collection process for a page view.
  private val PAGE_VIEW_DATA_COLLECTION_PERIOD = 60L
  // The time to keep the data associated with a page view.
  private val PAGE_VIEW_DATA_EXPIRY = 600L

  def report(report: UserReport): Unit = {
    ClientSideLogging.redisClient.foreach { client =>
      // The surrogate key is set to expire first. This causes the expiry notification to be sent
      // on the Redis pub-sub channel, triggering the callback which will forward the data into S3.
      // Nothing bad happens if data expires too soon, or the system falls behind; we just collect less data.
      client.setex(report.viewId, PAGE_VIEW_DATA_COLLECTION_PERIOD, "surrogate-key")

      // If the data key has been written before, then the time key must have been written as well, so we skip this.
      // Otherwise, the page view would appear in several time keys.
      if (!client.exists(ClientSideLogging.dataKeyFromId(report.viewId))) {
        // Register the page view at the current time. Use a time key-value which holds an array of all the view data
        // recorded for a given time period (minute periods).
        val timeKey = ClientSideLogging.reportsKeyFromDate(DateTime.now())
        client.sadd(timeKey, report.viewId)
        client.expire(timeKey, PAGE_VIEW_DATA_EXPIRY.toInt)
      }

      // Write the new report data to the data key.
      client.setex(ClientSideLogging.dataKeyFromId(report.viewId), PAGE_VIEW_DATA_EXPIRY, Json.toJson(report).toString)
    }
  }
}
