package model.notifications

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import org.joda.time.DateTime
import scala.collection.JavaConverters._
import awswrappers.dynamodb._

import scala.concurrent.Future


object DynamoDbStore extends Logging with ExecutionContexts {
  val tableName = Configuration.Notifications.notificationSubscriptionTable

  private val client = new AmazonDynamoDBAsyncClient(Configuration.aws.credentials.get)
  client.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def addItemToSubcription(gcmBrowserId: String, notificationTopicId: String): Future[UpdateItemResult] = {

    val updateItemRequest = new UpdateItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("notificationTopicId", new AttributeValue().withS(notificationTopicId)),
        ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
      ).asJava)
      .withUpdateExpression(s"SET createdDate = :createdDate")
      .withExpressionAttributeValues(Map[String, AttributeValue](
        ":createdDate" -> new AttributeValue().withN((DateTime.now.getMillis / 1000).toString)).asJava)

    val futureUpdateResult: Future[UpdateItemResult] = client.updateItemFuture(updateItemRequest)

    futureUpdateResult.onFailure {
      case t: Throwable =>
        val message = t.getMessage
        log.error(s"Unable to Subscribe $gcmBrowserId to $notificationTopicId: $message")}

    futureUpdateResult
  }

  def deleteItemFromSubcription(gcmBrowserId: String, notificationTopicId: String): Future[DeleteItemResult] = {

    val deleteItemRequest = new DeleteItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("notificationTopicId", new AttributeValue().withS(notificationTopicId)),
        ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
      ).asJava)

    val futureDeleteResult: Future[DeleteItemResult] = client.deleteItemFuture(deleteItemRequest)

    futureDeleteResult.onFailure {
      case t: Throwable =>
        val message = t.getMessage
        log.error(s"Unable to delete $gcmBrowserId for topic $notificationTopicId: $message")}

    futureDeleteResult
  }
}
