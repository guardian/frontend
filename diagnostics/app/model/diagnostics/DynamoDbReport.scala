package model.diagnostics

import awswrappers.dynamodb._
import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import model.diagnostics.csp.CSPReport
import model.diagnostics.css.CssReport
import org.joda.time.LocalDate

import scala.collection.JavaConverters._
import scala.util.Try

trait DynamoDbReport[A] extends Logging with ExecutionContexts {
  val client = new AmazonDynamoDBAsyncClient(Configuration.aws.mandatoryCredentials)
  client.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def report(report: A): Unit
}

object CSSDynamoDbReport extends DynamoDbReport[CssReport] {
  private def dayKey(date: LocalDate) = date.toString("yyyy-MM-dd")

  private def updateItemRequestsFor(report: CssReport): Seq[UpdateItemRequest] = {
    report.selectors.toSeq map {
      case (selector, isUsed) =>
        new UpdateItemRequest()
          .withTableName("cssUsage")
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
  }

  def report(report: CssReport): Unit = {
    for {
      request <- updateItemRequestsFor(report)
    } {
      client.updateItemFuture(request) onFailure {
        case error: Throwable =>
          log.error(s"Failed to log CSS report to DynamoDB", error)
      }
    }
  }
}
