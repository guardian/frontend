package model.diagnostics.css

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model.{AttributeAction, AttributeValueUpdate, AttributeValue, UpdateItemRequest}
import common.{ExecutionContexts, Logging}
import org.joda.time.LocalDate
import scala.collection.JavaConverters._
import awswrappers.dynamodb._

object DynamoDbReport extends Logging with ExecutionContexts {
  val TableName = "cssUsage"
  private val client = new AmazonDynamoDBAsyncClient()
  client.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def dayKey(date: LocalDate) = date.toString("yyyy-MM-dd")

  def report(cssReport: CssReport): Unit = {
    val updateItemRequests = cssReport.selectors.toSeq map {
      case (selector, isUsed) =>
        new UpdateItemRequest()
          .withTableName(TableName)
          .withKey(Map[String, AttributeValue](
            ("day", new AttributeValue().withS(dayKey(LocalDate.now()))),
            ("selector", new AttributeValue().withS(selector))
          ).asJava)
          .withAttributeUpdates(Map[String, AttributeValueUpdate](
            (if (isUsed) "used" else "unused",
             new AttributeValueUpdate()
               .withAction(AttributeAction.ADD)
               .withValue(new AttributeValue().withN("1")))
          ).asJava)
    }

    for {
      request <- updateItemRequests
    } {
      client.updateItemFuture(request) onFailure {
        case error: Throwable =>
          log.error("Failed to log CSS report to dynamo DB", error)
      }
    }
  }

}
