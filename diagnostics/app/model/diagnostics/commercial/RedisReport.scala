package model.diagnostics.commercial

import common.{ExecutionContexts, Logging}
import common.commercial.ClientSideLogging
import org.joda.time.DateTime
import play.api.libs.json.Json

// RedisReport writes commercial performance beacons into Redis as key-values.
object RedisReport extends Logging with ExecutionContexts {

  // The time to keep the data associated with a page view. 20 minutes.
  private val PAGE_VIEW_DATA_EXPIRY = 1200L

  def report(report: UserReport): Unit = {
    ClientSideLogging.redisClient.foreach { client =>

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
