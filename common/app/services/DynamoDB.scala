package services

import conf.Configuration
import common.Logging
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.model.GetItemRequest;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import scala.collection.JavaConversions._
import scala.collection.JavaConverters._

sealed trait Destination {
  def location: String
}
case class Redirect(location: String) extends Destination
case class Archive(location: String) extends Destination

// TODO this all needs to go proper Async
trait DynamoDB extends Logging {

  lazy val tableName = "redirects"

  lazy val client = {
    val client = new AmazonDynamoDBClient(Configuration.aws.credentials)
    client.setEndpoint("dynamodb.eu-west-1.amazonaws.com")
    client
  }

  def destinationFor(source: String): Option[Destination] = {
    
    val url = new AttributeValue().withS(s"http://$source")

    val getItemRequest = new GetItemRequest()
          .withTableName(tableName)
          .withKey(mapAsJavaMap(Map("source" -> url)))
          .withAttributesToGet("destination", "archive")
   
    // wrap result in an option
    val result = Option(client.getItem(getItemRequest).getItem)

    result.map(_.asScala).flatMap{item =>
      item.get("destination").map(_.getS).map(Redirect).orElse{
        item.get("archive").map(_.getS).map(Archive)
      }
    }

  }
}

object DynamoDB extends DynamoDB
