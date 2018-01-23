package model.diagnostics.video

import common.Logging
import com.amazonaws.services.dynamodbv2.model
import com.amazonaws.services.dynamodbv2.model.{AttributeValue, GetItemRequest, UpdateItemRequest}

import scala.collection.JavaConverters._
import awswrappers.dynamodb._

import scala.concurrent.{ExecutionContext, Future}

object DynamoDbStore extends Logging {
  val tableName = "missingVideoEncodings"
  private val client = services.DynamoDB.asyncClient

  def storeMissingEncoding(videoSrc: String, webUrl: String)(implicit executionContext: ExecutionContext): Unit = {

    val updateItemRequest = new UpdateItemRequest()
      .withTableName(tableName)
      .withKey(Map[String, AttributeValue](
        ("video_src", new AttributeValue().withS(videoSrc)),
        ("web_url", new AttributeValue().withS(webUrl))
    ).asJava)

    client.updateItemFuture(updateItemRequest).failed.foreach { error: Throwable =>
      val message = error.getMessage
      log.error(s"Unable to record missing video encoding with Dynamo DB: $message", error)
    }
  }

  def haveSeenMissingEncoding(videoSrc: String, webUrl: String)(implicit executionContext: ExecutionContext): Future[Boolean] = {

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

