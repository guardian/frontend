package services

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient
import conf.Configuration
import scala.collection.JavaConversions._
import com.amazonaws.services.dynamodbv2.model.AttributeValue
import play.api.Play.current
import play.api.Play

object PagePresses {
  private lazy val table = if (Play.isProd) "redirects" else "redirects-DEV"

  private lazy val client = {
    val client = new AmazonDynamoDBClient(Configuration.aws.mandatoryCredentials)
    client.setEndpoint(AwsEndpoints.dynamoDb)
    client
  }

  def set(source: String, archive: String) = client.putItem(table,
    Map(
      "source" -> new AttributeValue(source),
      "archive" -> new AttributeValue(archive)
    )
  )

  // TODO: ready for when we add a takedown button to the UI
  def remove(source: String) = client.deleteItem(table,
    Map("source" -> new AttributeValue(source))
  )

}
