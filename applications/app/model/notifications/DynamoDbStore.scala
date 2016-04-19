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
import scala.util.{Success, Failure}


object DynamoDbStore extends Logging with ExecutionContexts {
  val tableName = Configuration.Notifications.notificationSubscriptionTable

  private val client = new AmazonDynamoDBAsyncClient(Configuration.aws.credentials.get)
  client.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def addItemToSubscription(browserEndpoint: String, notificationTopicId: String): Future[UpdateItemResult] = {

    val updateItemRequest = new UpdateItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("notificationTopicId", new AttributeValue().withS(notificationTopicId)),
        ("browserEndpoint", new AttributeValue().withS(browserEndpoint))
      ).asJava)
      .withUpdateExpression(s"SET createdDate = :createdDate")
      .withExpressionAttributeValues(Map[String, AttributeValue](
        ":createdDate" -> new AttributeValue().withN((DateTime.now.getMillis / 1000).toString)).asJava)

    val futureUpdateResult: Future[UpdateItemResult] = client.updateItemFuture(updateItemRequest)

    futureUpdateResult.onComplete {
      case Failure(t) =>
        val message = t.getMessage
        log.error(s"Unable to Subscribe $browserEndpoint to $notificationTopicId: $message")
      case Success(_) =>
        log.info(s"Successfully subscribed $browserEndpoint to $notificationTopicId")}

    futureUpdateResult
  }

  def deleteItemFromSubscription(browserEndpoint: String, notificationTopicId: String): Future[DeleteItemResult] = {

    val deleteItemRequest = new DeleteItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("notificationTopicId", new AttributeValue().withS(notificationTopicId)),
        ("browserEndpoint", new AttributeValue().withS(browserEndpoint))
      ).asJava)

    val futureDeleteResult: Future[DeleteItemResult] = client.deleteItemFuture(deleteItemRequest)

    futureDeleteResult.onComplete {
      case Failure(t) =>
        val message = t.getMessage
        log.error(s"Unable to delete $browserEndpoint for topic $notificationTopicId: $message")
      case Success(_) =>
        log.info(s"Successfully deleted $browserEndpoint from topic $notificationTopicId")}

    futureDeleteResult
  }
}
