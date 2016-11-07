package services

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient
import common.Logging
import conf.Configuration
import scala.collection.JavaConversions._
import com.amazonaws.services.dynamodbv2.model.AttributeValue

object PagePresses extends Logging {
  private lazy val table = if (Configuration.environment.isNonProd) "redirects-CODE" else "redirects"

  private lazy val client = {
    val client = new AmazonDynamoDBClient(Configuration.aws.mandatoryCredentials)
    client.setEndpoint(AwsEndpoints.dynamoDb)
    client
  }

  def set(source: String, archive: String) = {
    log.info(s"set: $table: $source -> $archive")
    client.putItem(table,
      Map(
        "source" -> new AttributeValue(source),
        "archive" -> new AttributeValue(archive)
      )
    )
  }

  def remove(source: String) = {
    log.info(s"remove: $table: $source")
    client.deleteItem(table, Map("source" -> new AttributeValue(source)))
  }

}
