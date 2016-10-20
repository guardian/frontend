package services

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient
import conf.Configuration
import scala.collection.JavaConversions._
import com.amazonaws.services.dynamodbv2.model.AttributeValue

object Redirects {

  private lazy val table = if (Configuration.environment.isProd) "redirects" else "redirects-CODE"

  private lazy val client = {
    val client = new AmazonDynamoDBClient(Configuration.aws.mandatoryCredentials)
    client.setEndpoint(AwsEndpoints.dynamoDb)
    client
  }

  def set(from: String, to: String) = client.putItem(table,
    Map(
      "source" -> new AttributeValue(from),
      "destination" -> new AttributeValue(to)
    )
  )

  def remove(from: String) = client.deleteItem(table,
    Map("source" -> new AttributeValue(from))
  )
}
