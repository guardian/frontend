package services

import com.gu.scanamo.{Scanamo, ScanamoAsync}
import com.gu.scanamo.syntax._
import common.{ExecutionContexts, Logging}
import conf.Configuration

import scala.concurrent.Future


object Redirects {
  case class Redirect(source: String, destination: Option[String] = None, archive: Option[String] = None)

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
  import Redirects._

  // protocol fixed to http so that lookups to dynamo find existing redirects
  private val expectedSourceProtocol = "http://"
  private lazy val tableName = if (Configuration.environment.isProd) "redirects" else "redirects-CODE"


  def destinationFor(source: String): Future[Option[Destination]] =
    ScanamoAsync
      .get[Redirect](DynamoDB.asyncClient)(tableName)('source -> (expectedSourceProtocol + source))
      .map {
        case Some(Right(Redirect(_, Some(d), _))) => Some(External(d))
        case Some(Right(Redirect(_, _, Some(a)))) => Some(Archive(a))
        case _ => None
      }

  def set(redirect: Redirect) = {
    log.info(s"Setting redirect in: $tableName to: ${redirect.source} -> ${redirect.destination.getOrElse(redirect.archive)}")
    Scanamo.put(DynamoDB.syncClient)(tableName)(redirect)
  }

  def remove(source: String) = {
    log.info(s"Removing redirect in: $tableName to: $source")
    Scanamo.delete(DynamoDB.syncClient)(tableName)('source -> source)
  }
}
