package services

import conf.Configuration
import common.{ExecutionContexts, Logging}
import scala.collection.JavaConversions._
import com.amazonaws.auth.AWS4Signer
import com.amazonaws.{AmazonWebServiceRequest, DefaultRequest}
import java.net.URI
import play.api.libs.ws.WSClient
import com.amazonaws.util.StringInputStream
import scala.concurrent.Future


sealed trait Destination {
  def location: String
}
case class Redirect(location: String) extends Destination
case class Archive(location: String) extends Destination

class DynamoDB(wsClient: WSClient) extends Logging with ExecutionContexts {
  private val tableName = if (Configuration.environment.isProd) "redirects" else "redirects-CODE"
  private val dynamoDbGet = "DynamoDB_20120810.GetItem"

  // protocol fixed to http so that lookups to dynamo find existing redirects
  private val expectedSourceProtocol = "http://"

  private lazy val credentials  = Configuration.aws.credentials

  def destinationFor(source: String): Future[Option[Destination]] = {
    credentials.map{ credentialsProvider =>
      val signer = new AWS4Signer()
      def signedHeaders(xAmzTarget: String, bodyContent: String) = {
        val request = new DefaultRequest[Nothing](new AmazonWebServiceRequest {}, "DynamoDB")
        request.setEndpoint(new URI(s"http://${AwsEndpoints.dynamoDb}"))
        request.addHeader("Content-Type", "application/x-amz-json-1.0")
        request.addHeader("x-amz-target", xAmzTarget)
        request.setContent(new StringInputStream(bodyContent))
        signer.setServiceName("dynamodb")
        signer.sign(request, credentialsProvider.getCredentials)
        request.getHeaders.toSeq
      }

      val bodyContent = s"""
      |{
      |   "TableName": "$tableName",
      |   "Key": {
      |     "source": {"S": "$expectedSourceProtocol$source"}
      |   }
      |}
      """.stripMargin

      val headers = signedHeaders(dynamoDbGet, bodyContent)

      val asyncRequest = wsClient.url(s"http://${AwsEndpoints.dynamoDb}")
        .withRequestTimeout(1000)
        .withHeaders(headers:_*)

      asyncRequest.post(bodyContent).map(_.json).map{ json =>
        (json \\ "destination").headOption.map(d => Redirect((d \ "S").as[String]))
          .orElse((json \\ "archive").headOption.map(a => Archive((a \ "S").as[String])))
      }
    }.getOrElse(Future.successful(None))
  }
}
