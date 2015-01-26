package css_report

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import awswrappers.dynamodb._
import com.amazonaws.services.dynamodbv2.model._
import org.joda.time.LocalDate
import play.api.libs.json.Json
import scala.collection.JavaConversions._
import scala.concurrent.Future
import scala.util.Try

object SelectorReport {
  implicit val jsonWrites = Json.writes[SelectorReport]
}

case class SelectorReport(selector: String, used: Int, unused: Int)

object CssReport {
  private val TableName = "cssUsage"
  private val dynamoDbClient = new AmazonDynamoDBAsyncClient()
  dynamoDbClient.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def index(): Future[Seq[LocalDate]] = {
    dynamoDbClient.queryFuture(new QueryRequest()
      .withTableName(TableName)
      .withKeyConditions(Map[String, Condition](
        "selector" -> new Condition()
          .withComparisonOperator(ComparisonOperator.EQ)
          .withAttributeValueList(new AttributeValue().withS("div"))
      ))
      .withAttributesToGet("day")
    ) map { response =>
      response.getItems map { item =>
        LocalDate.parse(item.get("day").getS)
      }
    }
  }

  def report(day: LocalDate): Future[Seq[SelectorReport]] = {
    dynamoDbClient.scanFuture(new ScanRequest()
      .withTableName(TableName)
      .withScanFilter(Map[String, Condition](
        "day" -> new Condition()
          .withComparisonOperator(ComparisonOperator.EQ)
          .withAttributeValueList(new AttributeValue().withS(day.toString("yyyy-MM-dd")))
      ))
      .withAttributesToGet("selector", "used", "unused")
    ) map { result =>
      result.getItems map { item =>
        SelectorReport(
          item.get("selector").getS,
          Try(item.get("used").getN.toInt) getOrElse 0,
          Try(item.get("unused").getN.toInt) getOrElse 0
        )
      }
    }
  }
}
