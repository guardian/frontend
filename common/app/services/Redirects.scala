package services

import com.gu.scanamo.error.MissingProperty
import com.gu.scanamo.syntax._
import com.gu.scanamo.{DynamoFormat, Scanamo, ScanamoAsync}
import common.{ExecutionContexts, Logging}
import conf.Configuration

import scala.concurrent.Future


object Redirects {
  sealed trait Destination {
    def source: String
    def location: String
  }

  implicit val destinationFormat = DynamoFormat.xmap[Destination, Map[String, String]] {
    case m if m.contains("destination") => Right(External(m("source"), m("destination")))
    case m if m.contains("archive") => Right(Archive(m("source"), m("archive")))
    case _ => Left(MissingProperty)
  } {
    case External(source, destination) => Map("source" -> source, "destination" -> destination)
    case Archive(source, archive) => Map("source" -> source, "archive" -> archive)
  }

  // External is a permanent 3XX redirect - it could be guardian/non-guardian address
  case class External(source: String, location: String) extends Destination

  // Archive refers to an internal redirect to an s3 bucket location - that is, it will
  // use the X-Accel-Redirect header to instruct nginx to perform the redirect "internally"
  case class Archive(source: String, location: String) extends Destination
}


class Redirects extends Logging with ExecutionContexts {
  import Redirects._

  // protocol fixed to http so that lookups to dynamo find existing redirects
  private val expectedSourceProtocol = "http://"
  private lazy val tableName = if (Configuration.environment.isProd) "redirects" else "redirects-CODE"


  def destinationFor(source: String): Future[Option[Destination]] =
    ScanamoAsync
      .get[Destination](DynamoDB.asyncClient)(tableName)('source -> (expectedSourceProtocol + source))
      .map({
        case Some(Right(destination)) => Some(destination)
        case _ => None
      })

  def set(destination: Destination) = {
    log.info(s"Setting redirect in: $tableName to: ${destination.source} -> ${destination.location}")
    Scanamo.put(DynamoDB.syncClient)(tableName)(destination)
  }

  def remove(source: String) = {
    log.info(s"Removing redirect in: $tableName to: $source")
    Scanamo.delete(DynamoDB.syncClient)(tableName)('source -> source)
  }
}
