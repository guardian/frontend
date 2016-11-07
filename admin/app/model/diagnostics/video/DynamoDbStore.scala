package model.diagnostics.video

import common.{ExecutionContexts, Logging}
import com.amazonaws.services.dynamodbv2.{model, AmazonDynamoDBAsyncClient}
import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.model.{GetItemRequest, AttributeValue, UpdateItemRequest}
import scala.collection.JavaConverters._
import awswrappers.dynamodb._
import conf.Configuration

import scala.concurrent.Future

object DynamoDbStore extends Logging with ExecutionContexts {
  val tableName = "missingVideoEncodings"
  private val client = new AmazonDynamoDBAsyncClient(Configuration.aws.credentials.get)
  client.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def storeMissingEncoding(videoSrc: String, webUrl: String): Unit = {

    val updateItemRequest = new UpdateItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("video_src", new AttributeValue().withS(videoSrc)),
        ("web_url", new AttributeValue().withS(webUrl))
    ).asJava)

    client.updateItemFuture(updateItemRequest) onFailure {
      case error: Throwable =>
        val message = error.getMessage
        log.error(s"Unable to record missing video encoding with Dynamo DB: $message")
    }
  }

  def haveSeenMissingEncoding(videoSrc: String, webUrl: String): Future[Boolean] = {

    val getItemRequest = new GetItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("video_src", new model.AttributeValue().withS(videoSrc)),
        ("web_url", new model.AttributeValue().withS(webUrl))
    ).asJava)

    val getItemResultFuture = client.getItemFuture(getItemRequest)

    getItemResultFuture map { result =>
      Option(result.getItem).isDefined
    }
  }
}

