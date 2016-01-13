package services

import conf.Configuration
import common.{ExecutionContexts, Logging}
import play.api.Play
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

trait DynamoDB extends Logging with ExecutionContexts {
  import play.api.Play.current
  private val tableName = if (Configuration.environment.isNonProd) "redirects-CODE" else "redirects"
  private val DynamoDbGet = "DynamoDB_20120810.GetItem"

  // should not directly call AWS during tests.
  private lazy val credentials  = Configuration.aws.credentials.filterNot(_ => Play.isTest)

  def destinationFor(source: String): Future[Option[Destination]] = {
    credentials.map{ credentialsProvider =>
      val signer = new AWS4Signer()
      def signedHeaders(xAmzTarget: String, bodyContent: String) = {
        val request = new DefaultRequest[Nothing](new AmazonWebServiceRequest {}, "DynamoDB")
        request.setEndpoint(new URI(s"http://${AwsEndpoints.dynamoDb}"))
        request.addHeader("Content-Type", "application/x-amz-json-1.0")
        request.addHeader("x-amz-target", xAmzTarget)
        request.setContent(new StringInputStream(bodyContent))
        signer.sign(request, credentialsProvider.getCredentials)
        request.getHeaders.toSeq
      }

      val bodyContent = s"""
      |{
      |   "TableName": "$tableName",
      |   "Key": {
      |     "source": {"S": "$source"}
      |   }
      |}
      """.stripMargin

      val headers = signedHeaders(DynamoDbGet, bodyContent)

      val asyncRequest = WS.url(s"http://${AwsEndpoints.dynamoDb}")
        .withRequestTimeout(1000)
        .withHeaders(headers:_*)

      asyncRequest.post(bodyContent).map(_.json).map{ json =>
        (json \\ "destination").headOption.map(d => Redirect((d \ "S").as[String]))
          .orElse((json \\ "archive").headOption.map(a => Archive((a \ "S").as[String])))
      }
    }.getOrElse(Future.successful(None))
  }
}

object DynamoDB extends DynamoDB
