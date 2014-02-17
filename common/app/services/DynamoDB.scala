package services

import conf.Configuration
import common.Logging
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.model.GetItemRequest;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import scala.collection.JavaConversions._
import play.Play

trait DynamoDB extends Logging {

  lazy val tableName = "redirects"

  lazy val client = {
    val client = new AmazonDynamoDBClient(Configuration.aws.credentials)
    client.setEndpoint("dynamodb.eu-west-1.amazonaws.com")
    client
  }

  def destinationFor(source: String) = {
    
    val url = new AttributeValue().withS(s"http://$source")

    val getItemRequest = new GetItemRequest()
          .withTableName(tableName)
          .withKey(mapAsJavaMap(Map("source" -> url)))
          .withAttributesToGet(List("destination"))
   
    // wrap result in an option
    val result = Option(client.getItem(getItemRequest).getItem)

    // given we search on the key we shouldn't expect more than one record
    result.map(_.get("destination").getS).headOption

  }

}

object DynamoDB extends DynamoDB
