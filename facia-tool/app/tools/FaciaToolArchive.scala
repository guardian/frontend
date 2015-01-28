package tools

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model._
import common.{ExecutionContexts, Logging}
import conf.{Switches, Configuration}
import org.joda.time.{DateTimeZone, DateTime}
import play.api.libs.json._
import scala.collection.JavaConverters._
import awswrappers.dynamodb._

import scala.util.{Failure, Success}

case class ArchiveRequest(email: String, updateJson: JsValue, diff: JsValue)

object FaciaToolArchive extends ExecutionContexts with Logging {
  val TableName = "FaciaToolUpdateHistory"
  private val dynamoClient: Option[AmazonDynamoDBAsyncClient] =
    if (Configuration.environment.isProd) {
      val c = new AmazonDynamoDBAsyncClient()
      c.setRegion(Region.getRegion(Regions.EU_WEST_1))
      Option(c)
    } else None

  def dayKey(date: DateTime) = date.toString("yyyy-MM-dd")
  def timeKey(date: DateTime) = date.toString("HH:mm:ss")

  def archive(archiveRequest: ArchiveRequest): Unit = {
    dynamoClient match {
      case Some(client) if Switches.FaciaDynamoArchive.isSwitchedOn =>
        Json.toJson(archiveRequest.updateJson).transform[JsObject](Reads.JsObjectReads) match {
          case JsSuccess(result, _) =>
            val archiveJson: String = Json.prettyPrint(result + ("diff", archiveRequest.diff))
            val now = DateTime.now().withZone(DateTimeZone.UTC)
            val putItemRequest = new PutItemRequest()
              .withTableName(TableName)
              .withItem(Map[String, AttributeValue](
              ("day", new AttributeValue().withS(dayKey(now))),
              ("time", new AttributeValue().withS(timeKey(now))),
              ("email", new AttributeValue().withS(archiveRequest.email)),
              ("rawupdate", new AttributeValue().withS(archiveJson))).asJava)

            client.putItemFuture(putItemRequest).onComplete {
              case Success(_) => log.info(s"Successfully put archive record for ${archiveRequest.email}")
              case Failure(t) => log.warn(s"Error putting archive record for ${archiveRequest.email}: $t")
            }

          case JsError(errors)  => log.warn(s"Could not archive request from ${archiveRequest.email}: $errors")}
      case Some(_) => log.warn(s"Did not archive to dynamo for ${archiveRequest.email}; switched OFF")
      case None    => log.warn(s"No client to archive record for ${archiveRequest.email}, is this PROD")
    }
  }
}
