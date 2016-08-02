package model.diagnostics.commercial

import akka.actor.{ActorSystem, Props}
import com.redis.{M => Message, S => Subscribed, E => Error, U => Unsubscribed, _}
import common.{ExecutionContexts, Logging}
import conf.Configuration
import play.api.libs.json.Json
import services.S3

/*
ExpiredKeyEventSubscriber listens to Redis notifications. When a key expires, it gathers
all the known data for that surrogate key from Redis, and writes a single loggable report object into S3.
*/
class ExpiredKeyEventSubscriber(client: RedisClient, system: ActorSystem) extends Logging {

  val expiredKeyEventChannel = "__keyevent@0__:expired"

  val subscriber = system.actorOf(Props(new Subscriber(client)))

  subscriber ! Register(callback)
  sub(List(expiredKeyEventChannel))

  def sub(channels: List[String]) = {
    subscriber ! Subscribe(channels.toArray)
  }

  def callback(pubsub: PubSubMessage) = pubsub match {
    case Message(`expiredKeyEventChannel`, id) if !id.endsWith("-data") => {
        log.logger.info(s"expired key event received for $id")
        uploadReportToS3(id)
    }
    case Message(_, message) => log.logger.info(s"generic redis message received: $message")
    case Unsubscribed(_, _) =>
    case Subscribed(channel, _) => log.logger.info(s"subscribed to redis channel: $channel")
    case Error(_) =>
  }

  private def uploadReportToS3(id: String): Unit = {
    log.logger.info(s"attempting s3 bucket upload, view id: $id")

    try {
      for {
        redisClient <- RedisReport.redisClient
        reportData <- redisClient.get(RedisReport.dataKeyFromId(id))
      } {
        log.logger.info(s"writing report to s3 bucket, view id: $id")
        S3CommercialReports.putPublic(id, reportData, "text/plain")
      }
    } catch {
      case e:Exception => log.logger.error(e.getMessage)
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

  // Make a client for each usage, otherwise there may be protocol errors.
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

  def dataKeyFromId(viewId: String): String = viewId + "-data"

  def report(report: Report): Unit = {
    redisClient.foreach { client =>
      // The surrogate key is set to expire first. This causes the expiry notification to be sent
      // on the Redis pub-sub channel, triggering the callback which will forward the data into S3.
      // Nothing bad happens if data expires too soon, or the system falls behind; we just collect less data.
      client.setex(report.viewId, 5L, "surrogate-key")
      client.setex(dataKeyFromId(report.viewId), 10L, Json.toJson(report).toString)
    }
  }
}
