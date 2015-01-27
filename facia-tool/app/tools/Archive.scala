package tools

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import org.joda.time.{DateTimeZone, DateTime}
import play.api.libs.json.{Json, JsValue}
import scala.collection.JavaConverters._
import awswrappers.dynamodb._

import scala.util.{Failure, Success}

case class ArchiveRequest(email: String, updateJson: JsValue)

object Archive extends ExecutionContexts with Logging {
  val TableName = "FaciaToolUpdateHistory"
  private val client = new AmazonDynamoDBAsyncClient(Configuration.aws.credentials.get)
  client.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def dayKey(date: DateTime) = date.toString("yyyy-MM-dd")
  def timeKey(date: DateTime) = date.toString("HH:mm:ss")

  def report(archiveRequest: ArchiveRequest): Unit = {
    val now = DateTime.now().withZone(DateTimeZone.UTC)
    val putItemRequest = new PutItemRequest()
          .withTableName(TableName)
          .withItem(Map[String, AttributeValue](
          ("day", new AttributeValue().withS(dayKey(now))),
          ("time", new AttributeValue().withS(timeKey(now))),
          ("email", new AttributeValue().withS(archiveRequest.email)),
          ("rawupdate", new AttributeValue().withS(Json.stringify(archiveRequest.updateJson)))).asJava)

    client.putItemFuture(putItemRequest).onComplete {
      case Success(_) => log.info(s"Successfully put archive record for ${archiveRequest.email}")
      case Failure(t) => log.warn(s"Error putting archive record for ${archiveRequest.email}: $t")
    }
  }
}
