package common.commercial

import com.redis.RedisClient
import common.GuLogging
import conf.Configuration
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat

object ClientSideLogging extends GuLogging {

  val reportFormat = DateTimeFormat.forPattern("ddMMYYYY-HH:mm:ss").withZoneUTC()

  def dataKeyFromId(viewId: String): String = viewId + "-data"

  def reportsKeyFromDate(dateTime: DateTime): String = reportFormat.print(dateTime) + "-views"

  def getReports(dateTime: DateTime): List[String] = {
    val reports = for {
      client <- redisClient.toList
      maybeSet <- client.smembers[String](ClientSideLogging.reportsKeyFromDate(dateTime)).toList
      maybeViewId <- maybeSet
      viewId <- maybeViewId
      report <- client.get[String](ClientSideLogging.dataKeyFromId(viewId))
    } yield {
      report
    }
    reports
  }

  def cleanUpReports(dateTime: DateTime): Unit = {
    redisClient.map(client => {
      val timeKey = ClientSideLogging.reportsKeyFromDate(dateTime)
      val pageViewIds = client.smembers[String](timeKey).map(_.flatten).getOrElse(List())
      val dataKeys = pageViewIds.map(ClientSideLogging.dataKeyFromId)
      client.del(dataKeys ++ timeKey)
    })
  }

  // Make a client for each usage, otherwise there may be protocol errors.
  def redisClient: Option[RedisClient] = {
    try {
      Configuration.redis.endpoint.map(new RedisClient(_, 6379))
    } catch {
      case e: Exception =>
        log.logger.error(e.getMessage)
        None
    }
  }
}
