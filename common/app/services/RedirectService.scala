package services

import com.gu.scanamo.error.MissingProperty
import com.gu.scanamo.syntax._
import com.gu.scanamo.{DynamoFormat, Scanamo, ScanamoAsync}
import common.Logging
import conf.Configuration

import scala.concurrent.{ExecutionContext, Future}


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


class RedirectService(implicit executionContext: ExecutionContext) extends Logging {
  import RedirectService._

  // protocol fixed to http so that lookups to dynamo find existing
  // redirects which were originally all stored as http://...
  private val expectedSourceHost = "http://www.theguardian.com"
  private val CombinerTags = """^(/[\w\d-/]+)\+([\w\d-/]+)$""".r
  private lazy val tableName = if (Configuration.environment.isProd) "redirects" else "redirects-CODE"


  def destinationForCombiner(source: String, tag1: String, tag2: String) : Future[Option[Destination]] = {
    val rssSuffix: String = if (tag2.endsWith("/rss")) "/rss" else ""
    // for paths such as /lifeandstyle/restaurants+lifeandstyle/wine/rss, we want to look up
    // /lifeandstyle/food and /lifeandstyle/wine individually - so the second tag needs cleaning
    val tag2Cleaned = s"/${tag2.replace("/rss", "")}"
    // look up each tag to check if there is a redirect set for it
    val newDestinations = for {
      d1 <- lookupRedirectDestination(tag1)
      d2 <- lookupRedirectDestination(tag2Cleaned)
    } yield (d1.map(_.location), d2.map(_.location))
    // if redirects exist, generate a new combiner url including the redirects
    newDestinations.map{ dests => {
      val tag1RedirectLocation = dests._1.getOrElse(tag1)
      val tag2RedirectTag = dests._2.map(s => s.replace("https://www.theguardian.com/", "")).getOrElse(tag2Cleaned)

      val destination = s"$tag1RedirectLocation+$tag2RedirectTag$rssSuffix"
      if (destination != source) {
        Some(PermanentRedirect(source, destination))
      } else {
        None
      }
    }}
  }

  def getDestination(source: String): Future[Option[Destination]] = {
    source match {
      case CombinerTags(tag1, tag2) =>
        destinationForCombiner(source, tag1, tag2).flatMap(destOpt => destOpt.fold(lookupRedirectDestination(source))(_ => Future.successful(destOpt)))
      case _ => lookupRedirectDestination(source)
    }
  }

  def lookupRedirectDestination(source: String): Future[Option[Destination]] =
    ScanamoAsync
      .get[Destination](DynamoDB.asyncClient)(tableName)('source -> (expectedSourceHost + source))
      .map({
        case Some(Right(destination)) => Some(destination)
        case _ => None
      })

  private def normaliseSource(source: String): Option[String] = {
    val FullURL = """(https?://)?www\.theguardian\.com(.*)""".r

    source match {
      case FullURL(_, path) => Some(expectedSourceHost + path)
      case _ => None
    }
  }

  private def normaliseDestination(destination: Destination): Option[Destination] = {
    val pathOnly = normaliseSource(destination.source)

    destination match {
      case PermanentRedirect(_, location) => pathOnly.map(PermanentRedirect(_, location))
      case ArchiveRedirect(_, location) => pathOnly.map(ArchiveRedirect(_, location))
    }
  }

  def set(destination: Destination): Boolean =
    normaliseDestination(destination).exists { dest =>
      log.info(s"Setting redirect in: $tableName to: ${dest.source} -> ${dest.location}")
      Scanamo.put(DynamoDB.syncClient)(tableName)(dest)
      true
    }

  def remove(source: String): Boolean =
    normaliseSource(source).exists { src =>
      log.info(s"Removing redirect in: $tableName to: $src")
      Scanamo.delete(DynamoDB.syncClient)(tableName)('source -> src)
      true
    }
}
