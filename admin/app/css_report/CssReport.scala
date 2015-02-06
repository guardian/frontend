package css_report

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import awswrappers.dynamodb._
import com.amazonaws.services.dynamodbv2.model._
import common.ExecutionContexts
import org.joda.time.LocalDate
import scala.collection.JavaConversions._
import scala.concurrent.Future
import scala.util.Try
import DynamoDb._

import scalaz.std.list._
import scalaz.std.anyVal._
import scalaz.std.map._
import scalaz.std.tuple._
import scalaz.syntax.traverse._

case class SelectorReport(selector: String, used: Int, unused: Int)

object CssReport extends ExecutionContexts {
  private val DateFormat = "yyyy-MM-dd"
  private val TableName = "cssUsage"
  private val dynamoDbClient = new AmazonDynamoDBAsyncClient()
  dynamoDbClient.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def index(): Future[Seq[LocalDate]] = {
    dynamoDbClient.queryFuture(new QueryRequest()
      .withTableName(TableName)
      .withKeyConditions(Map[String, Condition](
        "selector" -> new Condition()
          .withComparisonOperator(ComparisonOperator.EQ)
          .withAttributeValueList(new AttributeValue().withS(".u-h"))
      ))
      .withAttributesToGet("day")
    ) map { response =>
      response.getItems map { item =>
        LocalDate.parse(item.get("day").getS)
      }
    }
  }

  def report(day: LocalDate): Future[List[SelectorReport]] = {
    dynamoDbClient.sumScan[List[SelectorReport]](new ScanRequest()
      .withTableName(TableName)
      .withScanFilter(Map[String, Condition](
      "day" -> new Condition()
        .withComparisonOperator(ComparisonOperator.EQ)
        .withAttributeValueList(new AttributeValue().withS(day.toString(DateFormat)))
    ))
      .withAttributesToGet("selector", "used", "unused")
    ) { result =>
      result.getItems.toList map { item =>
        SelectorReport(
          item.get("selector").getS,
          Try(item.get("used").getN.toInt) getOrElse 0,
          Try(item.get("unused").getN.toInt) getOrElse 0
        )
      }
    }
  }

  def aggregateReport: Future[List[SelectorReport]] = {
    dynamoDbClient.sumScan[Map[String, (Int, Int)]](new ScanRequest()
      .withTableName(TableName)
      .withAttributesToGet("selector", "used", "unused")
    ) { result =>
      result.getItems.toList.foldMap({ item =>
        Map(
          item.get("selector").getS -> (Try(item.get("used").getN.toInt) getOrElse 0, Try(item.get("unused").getN.toInt) getOrElse 0)
        )
      })
    } map { aggregates =>
      aggregates.toList.sortBy(_._1) map {
        case (selector, (used, unused)) => SelectorReport(selector, used, unused)
      }
    }
  }
}
