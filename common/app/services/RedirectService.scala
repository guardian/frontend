package services

import java.net.URI
import org.scanamo.syntax._
import org.scanamo.{DynamoFormat, MissingProperty, Scanamo, ScanamoAsync, Table}
import common.GuLogging
import conf.Configuration
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

object RedirectService {
  sealed trait Destination {
    def source: String
    def location: String
  }

  // NOTE: This code is copied from ArchiveController in the interest of not endlessly expanding the common
  // library. Changes made here should be reflected there - function is currently called 'normalise'
  // Our redirects are 'normalised' Vignette URLs, Ie. path/to/0,<n>,123,<n>.html -> path/to/0,,123,.html

  val R1ArtifactUrl = """^/(.*)/[0|1]?,[\d]*,(-?\d+),[\d]*(.*)""".r
  val ShortUrl = """^(/p/[\w\d]+).*$""".r

  def normalisePath(path: String): String =
    path match {
      case R1ArtifactUrl(p, artifactOrContextId, _) =>
        s"/$p/0,,$artifactOrContextId,.html"
      case ShortUrl(p) => p
      case _           => path
    }

  def normaliseURL(url: String): Option[String] = {
    Try(new URI(url).toURL).toOption.map { url =>
      val host = url.getHost
      val path = url.getPath
      val normalisedPath = normalisePath(path)
      s"https://$host$normalisedPath"
    }
  }

  implicit val destinationFormat: AnyRef with DynamoFormat[Destination] =
    DynamoFormat.xmap[Destination, Map[String, String]](
      {
        // map -> destination (i.e. reads)
        case m if m.contains("destination") => Right(PermanentRedirect(m("source"), m("destination")))
        case m if m.contains("archive")     => Right(ArchiveRedirect(m("source"), m("archive")))
        case _                              => Left(MissingProperty)
      },
      {
        // destination -> map (i.e. writes)
        case PermanentRedirect(source, destination) => Map("source" -> source, "destination" -> destination)
        case ArchiveRedirect(source, archive)       => Map("source" -> source, "archive" -> archive)
      },
    )

  // This is a permanent 3XX redirect - it could be guardian/non-guardian address
  case class PermanentRedirect(source: String, location: String) extends Destination

  // Archive refers to an internal redirect to an s3 bucket location - that is, it will
  // use the X-Accel-Redirect header to instruct nginx to perform the redirect "internally"
  case class ArchiveRedirect(source: String, location: String) extends Destination
}

class RedirectService(implicit executionContext: ExecutionContext) extends GuLogging {
  import RedirectService._

  // protocol fixed to http so that lookups to dynamo find existing
  // redirects which were originally all stored as http://...
  private val expectedSourceHost = "http://www.theguardian.com"
  private val CombinerTags = """^(/[\w\d-/]+)\+([\w\d-/]+)$""".r
  private lazy val tableName = if (Configuration.environment.isProd) "redirects" else "redirects-CODE"
  private lazy val table = Table[Destination](tableName)

  def destinationForCombiner(source: String, tag1: String, tag2: String): Future[Option[Destination]] = {
    // for paths such as /lifeandstyle/restaurants+lifeandstyle/wine/rss, we want to look up
    // /lifeandstyle/food and /lifeandstyle/wine individually - so the second tag needs cleaning
    // look up each tag to check if there is a redirect set for it
    val newDestinations = for {
      d1 <- lookupRedirectDestination(tag1)
      d2 <- lookupRedirectDestination(tag2)
    } yield (d1.map(_.location), d2.map(_.location))
    // if redirects exist, generate a new combiner url including the redirects
    newDestinations.map { destinations =>
      {
        val tag1RedirectLocation = destinations._1.getOrElse(tag1)
        val tag2RedirectTag = destinations._2.map(_.replace("https://www.theguardian.com/", "")).getOrElse(tag2)

        val destination = s"$tag1RedirectLocation+$tag2RedirectTag"
        if (destination != source) {
          Some(PermanentRedirect(source, destination))
        } else {
          None
        }
      }
    }
  }

  def isRss(source: String): Boolean = source.endsWith("/rss")

  def getDestination(source: String): Future[Option[Destination]] = {
    // strip /rss suffix as redirects won't exist for /rss urls
    val sourceNoRss = source.replaceAll("/rss$", "")

    val destination = sourceNoRss match {
      case CombinerTags(tag1, tag2) =>
        destinationForCombiner(sourceNoRss, tag1, tag2)
          .flatMap {
            case Some(d) => Future.successful(Some(d))
            case None    => lookupRedirectDestination(sourceNoRss)
          }
      case _ => lookupRedirectDestination(sourceNoRss)
    }
    destination.map(_.map {
      case PermanentRedirect(redirectSource, location) =>
        val newLocation = if (isRss(source)) location + "/rss" else location
        PermanentRedirect(redirectSource, newLocation)
      case otherRedirect => otherRedirect
    })
  }

  def lookupRedirectDestination(source: String): Future[Option[Destination]] = {
    val fullUrl = if (source.head == '/') expectedSourceHost + source else s"$expectedSourceHost/$source"
    ScanamoAsync(DynamoDB.asyncClient)
      .exec(table.get("source" === fullUrl))
      .map({
        case Some(Right(destination)) => Some(destination)
        case _                        => None
      })
  }

  private def normaliseSource(source: String): Option[String] = {
    val FullURL = """(https?://)?www\.theguardian\.com(.*)""".r

    source match {
      case FullURL(_, path) => Some(expectedSourceHost + normalisePath(path))
      case _                => None
    }
  }

  private def normaliseDestination(destination: Destination): Option[Destination] = {
    val pathOnly = normaliseSource(destination.source)

    destination match {
      case PermanentRedirect(_, location) => pathOnly.map(PermanentRedirect(_, location))
      case ArchiveRedirect(_, location)   => pathOnly.map(ArchiveRedirect(_, location))
    }
  }

  def set(destination: Destination): Boolean =
    normaliseDestination(destination).exists { dest =>
      log.info(s"Setting redirect in: $tableName to: ${dest.source} -> ${dest.location}")
      Scanamo(DynamoDB.syncClient).exec(table.put(dest))
      true
    }

  def remove(source: String): Boolean =
    normaliseSource(source).exists { src =>
      log.info(s"Removing redirect in: $tableName to: $src")
      Scanamo(DynamoDB.syncClient).exec(table.delete("source" === src))
      true
    }
}
