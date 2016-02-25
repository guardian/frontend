package model.notifications

import akka.actor.ActorSystem
import akka.util.ByteString

import common.{ExecutionContexts, Logging}
import org.joda.time.DateTime
import play.api.libs.concurrent.Akka
import play.api.libs.json.{Reads, Writes, JsPath, Json}
import play.api.libs.json.Reads._
import play.api.libs.json.Writes._

import redis.commands.TransactionBuilder
import redis.{ByteStringFormatter, Transaction, RedisClient}
import conf.Configuration
import redis.protocol.MultiBulk

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.{Failure, Success}
import play.api.libs.concurrent.{Akka => PlayAkka}
import play.api.Play.current
import play.api.libs.functional.syntax._



case class GCMMessage(clientId: String, topic: String, title: String, body: String)
case class RedisMessage(topic: String, title: String, body: String, time: Long)

object RedisMessage {

    implicit val redisMessageFormat  = Json.format[RedisMessage]

    implicit val redisMessageReads: Reads[RedisMessage] = (
      (JsPath \ "topic").read[String] and
        (JsPath \ "title").read[String] and
        (JsPath \ "body").read[String] and
        (JsPath \ "time").read[Long]
      ) (RedisMessage.apply _)

    implicit val redisMessageWrites: Writes[RedisMessage] = (
      (JsPath \ "topic").write[String] and
        (JsPath \ "title").write[String] and
        (JsPath \ "body").write[String] and
        (JsPath \ "time").write[Long]
      ) (unlift(RedisMessage.unapply))

    implicit val formatter = new ByteStringFormatter[RedisMessage] {
      override def serialize(redisMessage: RedisMessage) : ByteString = {
        ByteString(Json.stringify(Json.toJson(redisMessage)))
      }

      override def deserialize(bs: ByteString) : RedisMessage = {
        val s = bs.utf8String
        val jResdisMessage = Json.parse(bs.utf8String)
        jResdisMessage.as[RedisMessage]
      }
    }

    def fromGcmMessage(gCMMessage: GCMMessage) = RedisMessage(gCMMessage.topic, gCMMessage.title, gCMMessage.body, DateTime.now.getMillis / 1000)

}

object RedisMessageStore extends Logging with ExecutionContexts {

  implicit val theActorSystem: ActorSystem = actorSystem

  val redis: RedisClient = RedisClient(host=Configuration.redis.messageCacheHost, port=Configuration.redis.messageCachePort)
  val expiryInSecond: Int = 5.minutes.toSeconds.toInt

  def pingRedis: Future[String] = redis.ping()

  def leaveMessage(gcmMessage: GCMMessage) : Future[MultiBulk]= {
      val redisTransaction: TransactionBuilder = redis.transaction()
      redisTransaction.lpush(gcmMessage.clientId, RedisMessage.fromGcmMessage(gcmMessage))
      val result: Future[MultiBulk] = redisTransaction.exec()

    result.onComplete {
      case Success(multiBulk) => println(s"Successful redis transaction for ${gcmMessage.clientId} ($multiBulk)")
      case Failure(t) => println(s"Error in redis transaction: $t")
    }
   result
  }

  def getMessages(gcmClientId: String) : Future[Option[RedisMessage]] = {
   redis.lpop[RedisMessage](gcmClientId)
  }
}
