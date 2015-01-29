package tools

import awswrappers.dynamodb._
import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model.{AttributeValue, PutItemRequest}
import common.{ExecutionContexts, Logging}
import conf.{Switches, Configuration}
import implicits.JsonImplicits._
import org.joda.time.{DateTime, DateTimeZone}
import play.api.libs.json._
import scala.collection.JavaConverters._
import awswrappers.dynamodb._
import scala.util.{Failure, Success}

case class ArchiveRequest(collectionId: String, email: String, updateJson: JsValue, diff: JsValue)

object FaciaToolArchive extends ExecutionContexts with Logging {
  val TableName = "FaciaToolUpdateHistory"
  private val maybeDynamoClient: Option[AmazonDynamoDBAsyncClient] =
    if (Configuration.environment.isProd) {
      val c = new AmazonDynamoDBAsyncClient()
      c.setRegion(Region.getRegion(Regions.EU_WEST_1))
      Option(c)
    } else None

  def dayKey(date: DateTime) = date.toString("yyyy-MM-dd")
  def timeKey(date: DateTime) = date.toString("HH:mm:ss")

  def archive(archiveRequest: ArchiveRequest): Unit = {
    maybeDynamoClient match {
      case Some(dynamoAsyncClient) if Switches.FaciaDynamoArchive.isSwitchedOn =>
        val now = DateTime.now().withZone(DateTimeZone.UTC)
        val putItemRequest = new PutItemRequest()
          .withTableName(TableName)
          .withItem(Map[String, AttributeValue](
          ("date", new AttributeValue().withS(dayKey(now))),
          ("time", new AttributeValue().withS(timeKey(now))),
          ("datetime", new AttributeValue().withS(now.toString)),
          ("collectionid", new AttributeValue().withS(archiveRequest.collectionId)),
          ("email", new AttributeValue().withS(archiveRequest.email)),
          ("collectionjson", archiveRequest.updateJson.toAttributeValue),
          ("diff", archiveRequest.diff.toAttributeValue)).asJava)

        dynamoAsyncClient.putItemFuture(putItemRequest).onComplete {
          case Success(_) => log.info(s"Successfully put archive record for ${archiveRequest.email}")
          case Failure(t) => log.warn(s"Error putting archive record for ${archiveRequest.email}: $t")
        }
      case Some(_) => log.warn(s"Did not archive to dynamo for ${archiveRequest.email}; switched OFF")
      case None    => log.warn(s"No client to archive record for ${archiveRequest.email}, is this PROD")
    }
  }
}
