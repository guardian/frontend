package model.diagnostics.commercial

import akka.actor.Props
import com.redis._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import play.api.libs.json.Json
import play.libs.Akka
import services.S3

/*
ExpiredKeyEventSubscriber listens to notifications. When a key expires, it gathers
all the known data for that surrogate key from Redis, and writes a single loggable report object into S3.
*/
class ExpiredKeyEventSubscriber(client: RedisClient) {

  val expiredKeyEventChannel = "__keyevent@0__:expired"

  val subscriber = Akka.system().actorOf(Props(new Subscriber(client)))

  subscriber ! Register(callback)
  client.setConfig("notify-keyspace-events", "Ex")
  sub(List(expiredKeyEventChannel))

  def sub(channels: List[String]) = {
    subscriber ! Subscribe(channels.toArray)
  }

  def callback(pubsub: PubSubMessage) = pubsub match {
    case M(`expiredKeyEventChannel`, id) if !id.endsWith("-data") => {
      uploadReportToS3(id)
    }
    case _ =>
  }

  private def uploadReportToS3(id: String): Unit = {
    for {
      client <- RedisReport.redisClient
      reportData <- client.get(RedisReport.dataKeyFromId(id))
    } {
      S3CommercialReports.putPublic(id, reportData, "text/plain")
    }
  }
}

object S3CommercialReports extends S3 {
  override lazy val bucket = "commercial-client-logs"
}

/*
RedisReport writes commercial performance beacons into Redis as key-values.
When the key expires, the ExpiredKeyEventSubscriber object will be notified.
*/
object RedisReport extends Logging with ExecutionContexts {

  def redisClient: Option[RedisClient] = {
    try {
      Configuration.redis.endpoint.map(new RedisClient(_, 6379))
    }
    catch {
      case e: Exception =>
        log.logger.error(e.getMessage)
        None
    }
  }

  lazy val subscriber: Option[ExpiredKeyEventSubscriber] = redisClient.map { client =>
    new ExpiredKeyEventSubscriber(client)
  }

  def dataKeyFromId(viewId: String): String = viewId + "-data"

  def report(report: Report): Unit = {
    subscriber
    redisClient.foreach { client =>
      client.setex(report.viewId, 5L, "surrogate-key")
      client.setex(dataKeyFromId(report.viewId), 10L, Json.toJson(report).toString)
    }
  }
}