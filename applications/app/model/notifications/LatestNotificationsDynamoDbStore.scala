package model.notifications

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import model.notifications.DynamoDbStore._
import scala.collection.JavaConverters._
import awswrappers.dynamodb._
import scala.concurrent.Future
import play.api.libs.json._

case class LatestMessage(title: String, body: String) {
    lazy val toJson = JsObject(
      Seq("title" -> JsString(title), "body" -> JsString(body))
    )
}

object LatestNotificationsDynamoDbStore extends Logging with ExecutionContexts {

    val tableName = "latest-notification-test"
    private val client = new AmazonDynamoDBAsyncClient(Configuration.aws.credentials.get)
    client.setRegion(Region.getRegion(Regions.EU_WEST_1))

    def storeMessage(gcmBrowserId: String, title: String, body: String): Unit = {

      val messageAttributeValue : AttributeValue =
        new AttributeValue().withL((1 until 3 map { case cnt =>
          new AttributeValue().withM(
            Map[String, AttributeValue] (
              ("title", new AttributeValue().withS(s"${title} ${cnt}")),
              ("body", new AttributeValue().withS(s"${body} ${cnt}"))
            ).asJava
          )
        }).asJava)


      val updateItemRequest = new UpdateItemRequest()
        .withTableName(tableName)
        .withKey(Map[String, AttributeValue] (
          ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
        ).asJava)
        .withAttributeUpdates(Map[String, AttributeValueUpdate](
          ("messages",
             new AttributeValueUpdate()
                .withAction(AttributeAction.PUT)
                .withValue(messageAttributeValue)
            )).asJava)

      client.updateItemFuture(updateItemRequest) onFailure {
        case t: Throwable =>
          val message = t.getMessage
          log.error(s"Unable to add new message to db: ${t.getMessage}" )
      }
    }

    def getLatestMessage(gcmBrowserId: String): Future[Map[String, AttributeValue]] = {

        val getItemRequest = new GetItemRequest()
          .withTableName(tableName)
          .withKey(Map[String,AttributeValue](
            ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
          ).asJava)

        val getItemResultFuture = client.getItemFuture(getItemRequest)

        getItemResultFuture map { result =>
            result.getItem.asScala.toMap
        }
    }

    def getLatestMessageAndCheck(gcmBrowserId: String): Future[List[LatestMessage]] = {


      val getItemRequest = new GetItemRequest()
        .withTableName(tableName)
        .withKey(Map[String,AttributeValue](
          ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
        ).asJava)

      val getItemResultFuture = client.getItemFuture(getItemRequest)

      getItemResultFuture map { result =>
          val resultMap = result.getItem.asScala.toMap
          val messages = resultMap.get("messages")map {
            messageAttributeList =>
              val messageList = messageAttributeList.getL()
              messageList.asScala.toList.map {
                message =>
                    val messageMap = message.getM.asScala.toMap
                    //TODO inline or map
                    val title = messageMap.get("title").get.getS
                    val body = messageMap.get("body").get.getS
                    LatestMessage(title, body)
                }
          }
          messages.getOrElse(List.empty)

      }
    }
}
