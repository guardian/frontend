package controllers

import common._
import play.api.mvc._
import services.{Archive, DynamoDB, Googlebot404Count}
import java.net.URLDecoder
import model.Cached
import scala.concurrent.Future.successful

object ArchiveController extends Controller with Logging with ExecutionContexts {
 
  private def destinationFor(path: String) = DynamoDB.destinationFor(path).map(_.filterNot { destination =>
      linksToItself(path, destination.location)
  })

  private def isArchived(path: String) = services.S3Archive.getHtml(path)

  def isEncoded(path: String): Option[String] = {
    val decodedPath = URLDecoder.decode(path, "UTF-8")
    if (decodedPath != path) Some(decodedPath) else None
  } 

  // arts/gallery/image/0,,-126 -> arts/pictures/image/0,,-126
  def isGallery(path: String): Option[String] = if (path contains "/gallery/")
    Some(path.replace("/gallery/", "/pictures/"))
  else
    None


  // Our redirects are 'normalised' Vignette URLs, Ie. path/to/0,<n>,123,<n>.html -> path/to/0,,123,.html
  private val r1ArtifactUrl = """www.theguardian.com/(.*)/[0|1]?,[\d]*,(-?\d+),[\d]*(.*)""".r
  def normalise(path: String, zeros: String = ""): Option[String] = {
    path match {
      case r1ArtifactUrl(path, artifactOrContextId, extension) =>
        val normalisedUrl = s"www.theguardian.com/$path/0,,$artifactOrContextId,$zeros.html"
        Some(normalisedUrl)
      case _ => None
    }
  }

  private val PathPattern = s"""www.theguardian.com/([\\w\\d-]+)/(.*)""".r
  def linksToItself(path: String, destination: String): Boolean = path match {
    case PathPattern(_, r1path) => destination contains r1path
    case _ => false
  }

  def lookup(path: String) = Action.async{ implicit request =>
  
    /*
     * This is a chain of tests that look at the URL path and attempt to figure
     * out what should happen to the request.
     *
     * As much as possible we want to normalise any odd looking URLs before sending
     * a HTTP 2XX by sending a 3XX response back to the client. 
     *
     * Typically we want any redirects to happen first as these are free,
     * before falling through to a couple of lookups in s3 and dyanmodb.
     *
     * If we don't find a record of the given path we ultimately need to serve
     * a 404.
     *
     * Beware of creating redirect loops!
     */

    isEncoded(path).map(url => successful(Redirect(s"http://$url", 301)))
      .getOrElse(lookupPath(path)
      .map( _.orElse(redirectGallery(path))
      .getOrElse{
        log.info(s"Not Found (404): $path")
        logGoogleBot(request)
        NotFound
      }))
  }

  private def logDestination(path: String, msg: String, destination: String) {
    log.info(s"Destination: $msg : $path -> $destination")
  }

  // do some specific logging for Googlebot.
  // we really want to know how many of these (and what) are 404'ing
  private def logGoogleBot(request: Request[AnyContent]) = request.headers.get("User-Agent")
    .filter(_.contains("Googlebot")).foreach { bot =>
      log.info(s"GoogleBot => ${request.uri}")
      Googlebot404Count.increment()
  }

  private def lookupPath(path: String) = destinationFor(s"http://${normalise(path).getOrElse(path)}").map { _.map {
    case services.Redirect(url) =>
      logDestination(path, "redirect", url)
      Cached(300)(Redirect(url, 301))
    case Archive(archivePath) =>
      // http://wiki.nginx.org/X-accel
      logDestination(path, "archive", archivePath)
      Cached(300)(Ok.withHeaders("X-Accel-Redirect" -> s"/s3-archive/$archivePath"))
  }}

  // needs to happen *after* s3 lookup as some old galleries
  // are still served under the URL 'gallery'
  private def redirectGallery(path: String) = isGallery(path).map { url =>
    logDestination(path, "gallery", url)
    Redirect(s"http://$url", 301)
  }
}
