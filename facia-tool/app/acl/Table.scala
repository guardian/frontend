package acl

import awswrappers.dynamodb._
import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model.{ResourceNotFoundException, AttributeValue, GetItemRequest}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.collection.JavaConversions._

object Table {
  val client: AmazonDynamoDBAsyncClient = new AmazonDynamoDBAsyncClient().withRegion(Region.getRegion(Regions.EU_WEST_1))
  val TableName = "BreakingNewsAccessControlList"

  def hasBreakingNewsAccess(email: String): Future[Boolean] = {
    client.getItemFuture(new GetItemRequest().withTableName(TableName).withKey(Map(
      "email" -> new AttributeValue().withS(email)
    ))).map(_ => true) recover {
      case error: ResourceNotFoundException => false
    }
  }
}
