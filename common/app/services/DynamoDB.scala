package services

import conf.Configuration
import common.{ExecutionContexts, Logging}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient
import scala.collection.JavaConversions._
import com.amazonaws.auth.AWS4Signer
import com.amazonaws.{AmazonWebServiceRequest, DefaultRequest}
import java.net.URI
import play.api.libs.ws.WS
import com.amazonaws.util.StringInputStream
import scala.concurrent.Future

sealed trait Destination {
  def location: String
}
case class Redirect(location: String) extends Destination
case class Archive(location: String) extends Destination

// TODO this all needs to go proper Async
trait DynamoDB extends Logging with ExecutionContexts {


  private val tableName = "redirects"
  private val DynamoDbGet = "DynamoDB_20120810.GetItem"

  lazy val client = {
    val client = new AmazonDynamoDBClient(Configuration.aws.credentials)
    client.setEndpoint("dynamodb.eu-west-1.amazonaws.com")
    client
  }

  def destinationFor(source: String): Future[Option[Destination]] = {

    val bodyContent = s"""
      |{
      |   "TableName": "$tableName",
      |   "Key": {
      |     "source": {"S": "$source"}
      |   }
      |}
      """.stripMargin

    val headers = signedHeaders(DynamoDbGet, bodyContent)

    val asyncRequest = WS.url("http://dynamodb.eu-west-1.amazonaws.com")
      .withHeaders(headers:_*)

    asyncRequest.post(bodyContent).map(_.json).map{ json =>
      (json \\ "destination").headOption.map(d => Redirect((d \ "S").as[String]))
      .orElse((json \\ "archive").headOption.map(a => Archive((a \ "S").as[String])))
    }
  }

  // I'm not 100% sure, but this might just work for lots of different request types...
  // might be a candidate for reuse at some point
  private val signer = new AWS4Signer()
  private val credentialsProvider = Configuration.aws.credentials
  private def signedHeaders(xAmzTarget: String, bodyContent: String) = {
    val request = new DefaultRequest[Nothing](new AmazonWebServiceRequest {}, "DynamoDB")
    request.setEndpoint(new URI("http://dynamodb.eu-west-1.amazonaws.com"))
    request.addHeader("Content-Type", "application/x-amz-json-1.0")
    request.addHeader("x-amz-target", xAmzTarget)
    request.setContent(new StringInputStream(bodyContent))
    signer.sign(request, credentialsProvider.getCredentials)
    request.getHeaders.toSeq
  }

}

object DynamoDB extends DynamoDB
