package model.notifications

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model.{DeleteItemRequest, AttributeValue, UpdateItemRequest}
import common.{ExecutionContexts, Logging}
import conf.Configuration
import scala.collection.JavaConverters._
import awswrappers.dynamodb._

object DynamoDbStore extends Logging with ExecutionContexts {
  val tableName = "webNotifications"

  private val client = new AmazonDynamoDBAsyncClient(Configuration.aws.credentials.get)
  client.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def addItemToSubcription(registrationId: String, contentId: String): Unit = {

    val updateItemRequest = new UpdateItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("ContentId", new AttributeValue().withS(contentId)),
        ("RegistrationId", new AttributeValue().withS(registrationId))
      ).asJava)

    client.updateItemFuture(updateItemRequest) onFailure {
      case t: Throwable =>
        val message = t.getMessage
        log.error(s"Unable to record missing video encoding with Dynamo DB $message")
    }
  }

  def deleteItemFromSubcription(registrationId: String, contentId: String): Unit = {

    val deleteItemRequest = new DeleteItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("ContentId", new AttributeValue().withS(contentId)),
        ("RegistrationId", new AttributeValue().withS(registrationId))
      ).asJava)

    client.deleteItemFuture(deleteItemRequest) onFailure {
      case t: Throwable =>
        val message = t.getMessage
        log.error(s"Unable to delete item from subscription $message")
    }
  }
}
