package services

import com.amazonaws.services.dynamodbv2.model.AttributeValue
import common.Logging
import conf.Configuration

import scala.collection.JavaConversions._

object PagePresses extends Logging {
  private lazy val table = if (Configuration.environment.isNonProd) "redirects-CODE" else "redirects"

  private lazy val client = services.DynamoDB.syncClient

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
