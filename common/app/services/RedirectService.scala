package services

import com.gu.scanamo.error.MissingProperty
import com.gu.scanamo.syntax._
import com.gu.scanamo.{DynamoFormat, Scanamo, ScanamoAsync}
import common.{ExecutionContexts, Logging}
import conf.Configuration

import scala.concurrent.Future
import scala.util.Try


object RedirectService {
  sealed trait Destination {
    def source: String
    def location: String
  }

  implicit val destinationFormat = DynamoFormat.xmap[Destination, Map[String, String]] {
    // map -> destination (i.e. reads)
    case m if m.contains("destination") => Right(PermanentRedirect(m("source"), m("destination")))
    case m if m.contains("archive") => Right(ArchiveRedirect(m("source"), m("archive")))
    case _ => Left(MissingProperty)
  } {
    // destination -> map (i.e. writes)
    case PermanentRedirect(source, destination) => Map("source" -> source, "destination" -> destination)
    case ArchiveRedirect(source, archive) => Map("source" -> source, "archive" -> archive)
  }

  // This is a permanent 3XX redirect - it could be guardian/non-guardian address
  case class PermanentRedirect(source: String, location: String) extends Destination

  // Archive refers to an internal redirect to an s3 bucket location - that is, it will
  // use the X-Accel-Redirect header to instruct nginx to perform the redirect "internally"
  case class ArchiveRedirect(source: String, location: String) extends Destination
}


class RedirectService extends Logging with ExecutionContexts {
  import RedirectService._

  // protocol fixed to http so that lookups to dynamo find existing
  // redirects which were originally all stored as http://...
  private val expectedSourceHost = "http://www.theguardian.com"
  private lazy val tableName = if (Configuration.environment.isProd) "redirects" else "redirects-CODE"


  def destinationFor(source: String): Future[Option[Destination]] =
    ScanamoAsync
      .get[Destination](DynamoDB.asyncClient)(tableName)('source -> (expectedSourceHost + source))
      .map({
        case Some(Right(destination)) => Some(destination)
        case _ => None
      })

  private def normaliseSource(source: String): String = {
    val FullURL = """(https?://)?www\.theguardian\.com(.*)""".r

    source match {
      case FullURL(_, path) => expectedSourceHost + path
    }
  }

  private def normaliseDestination(destination: Destination): Destination = {
    val pathOnly = normaliseSource(destination.source)

    destination match {
      case PermanentRedirect(_, location) => PermanentRedirect(pathOnly, location)
      case ArchiveRedirect(_, location) => ArchiveRedirect(pathOnly, location)
    }
  }

  def set(destination: Destination): Try[Unit] =
    Try({
      val dest = normaliseDestination(destination)
      log.info(s"Setting redirect in: $tableName to: ${dest.source} -> ${dest.location}")
      Scanamo.put(DynamoDB.syncClient)(tableName)(dest)
    })

  def remove(source: String): Try[Unit] =
    Try({
      val src = normaliseSource(source)
      log.info(s"Removing redirect in: $tableName to: $src")
      Scanamo.delete(DynamoDB.syncClient)(tableName)('source -> src)
    })
}
