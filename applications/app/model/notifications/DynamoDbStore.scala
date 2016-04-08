package model.notifications

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model.{AttributeValue, DeleteItemRequest, UpdateItemRequest}
import common.{ExecutionContexts, Logging}
import conf.Configuration
import org.joda.time.DateTime
import scala.collection.JavaConverters._
import awswrappers.dynamodb._



object DynamoDbStore extends Logging with ExecutionContexts {
  val tableName = Configuration.Notifications.notificationSubscriptionTable

  private val client = new AmazonDynamoDBAsyncClient(Configuration.aws.credentials.get)
  client.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def addItemToSubcription(gcmBrowserId: String, notificationTopicId: String): Unit = {

    val updateItemRequest = new UpdateItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("notificationTopicId", new AttributeValue().withS(notificationTopicId)),
        ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId)),
        ("subscribeDate", new AttributeValue().withN((DateTime.now.getMillis / 1000).toString))
      ).asJava)

    client.updateItemFuture(updateItemRequest) onFailure {
      case t: Throwable =>
        val message = t.getMessage
        log.error(s"Unable to Subscribe $gcmBrowserId to $notificationTopicId: $message")
    }
  }

  def deleteItemFromSubcription(gcmBrowserId: String, notificationTopicId: String): Unit = {

    val deleteItemRequest = new DeleteItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("notificationTopicId", new AttributeValue().withS(notificationTopicId)),
        ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
      ).asJava)

    client.deleteItemFuture(deleteItemRequest) onFailure {
      case t: Throwable =>
        val message = t.getMessage
        log.error(s"Unable to unsubscribe $gcmBrowserId to $notificationTopicId: $message")
    }
  }
}
