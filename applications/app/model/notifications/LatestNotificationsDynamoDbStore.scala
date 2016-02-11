package model.notifications

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import model.notifications.DynamoDbStore._
import scala.collection.JavaConverters._
import awswrappers.dynamodb._

case class LatestMessage(title: String, body: String)

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
}
