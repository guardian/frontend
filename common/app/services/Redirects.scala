package services

import com.gu.scanamo.ScanamoAsync
import com.gu.scanamo.syntax._
import common.{ExecutionContexts, Logging}
import conf.Configuration

import scala.concurrent.Future


object Redirects {
  sealed trait Destination {
    def location: String
  }

  // External refers to any non-internal redirect - that is, it could be guardian/non-guardian
  // address but will be returned in the response Location header along with 3XX status
  case class External(location: String) extends Destination

  // Archive refers to an internal redirect to an s3 bucket location - that is, it will
  // use the X-Accel-Redirect header to instruct nginx to perform the redirect "internally"
  case class Archive(location: String) extends Destination
}


class Redirects extends Logging with ExecutionContexts {
  private val tableName = if (Configuration.environment.isProd) "redirects" else "redirects-CODE"

  // protocol fixed to http so that lookups to dynamo find existing redirects
  private val expectedSourceProtocol = "http://"

  def destinationFor(source: String): Future[Option[Redirects.Destination]] = {
    case class Redirect(destination: Option[String], archive: Option[String])

    ScanamoAsync
      .get[Redirect](DynamoDB.asyncClient)(tableName)('source -> (expectedSourceProtocol + source))
      .map {
        case Some(Right(Redirect(Some(d), _))) => Some(Redirects.External(d))
        case Some(Right(Redirect(_, Some(a)))) => Some(Redirects.Archive(a))
        case _ => None
      }
  }
}
