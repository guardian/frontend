package controllers

import common._
import play.api.mvc._
import views.support.RenderOtherStatus
import views.support._
import services.S3
import services.DynamoDB
import play.api.templates.Html
import java.net.URLDecoder

object ArchiveController extends Controller with Logging with ExecutionContexts {
 
  def isRedirect(path: String): Option[String] = {
    val redirects = DynamoDB.destinationFor(path)
    log.info(s"Checking '${path}' is a redirect in DynamoDB: ${!redirects.isEmpty}")
    redirects.filterNot { url => 
      linksToItself(path, url) 
    }
  }

  def isArchived(path: String): Option[String] = {
    val archive = services.S3Archive.getHtml(path)
    log.info(s"Checking '${path}' is a archived in S3: ${!archive.isEmpty}")
    archive
  }

  def isEncoded(path: String): Option[String] = {
    val decodedPath = URLDecoder.decode(path, "UTF-8")
    if (decodedPath != path) Some(decodedPath) else None
  } 

  // arts/gallery/image/0,,-126 -> arts/pictures/image/0,,-126
  def isGallery(path: String): Option[String] = {
    if (path contains "/gallery/") Some(path.replace("/gallery/", "/pictures/")) else None
  }

  // Our redirects are 'normalised' Vignette URLs, Ie. path/to/0,<n>,123,<n>.html -> path/to/0,,123,.html
  def normalise(path: String, zeros: String = ""): Option[String] = {
    val r1ArtifactUrl = """www.theguardian.com/(.*)/[0|1]?,[\d]*,(-?\d+),[\d]*(.*)""".r
    path match {
      case r1ArtifactUrl(path, artifactOrContextId, extension) => {
        val normalisedUrl = s"www.theguardian.com/${path}/0,,${artifactOrContextId},${zeros}.html"
        Some(normalisedUrl)
      }
      case _ => None
    }
  }

  // film/features/featurepages/0,,2291929,00.html -> 'film'
  def sectionFromR1Path(path: String): Option[String] = {
    val r1Url = s"""www.theguardian.com/([\\w\\d-]+)/(.*)/[0|1]?,.*""".r
    path match {
      case r1Url(section, path) => Option(s"/${section}")
      case _ => None
    } 
  }

  def lookup(path: String) = Action { implicit request =>
  
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

    isEncoded(path)
      .map {
        url => Redirect(s"http://${url}", 301)
      }.orElse { // DynamoDB lookup. This needs to happen *before* we poke around S3 for the file. 
        isRedirect(normalise(path).getOrElse(path)).map {
          url => Redirect(url, 301)
        }
      }.orElse { // S3 lookup
        isArchived(normalise(path, zeros = "00").getOrElse(path)).map {
          body => {
            val section = sectionFromR1Path(path).getOrElse("")
            val clean = withJsoup(body)(InBodyLinkCleanerForR1(section))
            Ok(views.html.archive(clean)).as("text/html")
          } 
        }
      }.orElse { // needs to happen *after* s3 lookup as some old galleries
                 // are still served under the URL 'gallery' 
        isGallery(path).map {
          url => Redirect(s"http://${url}", 301) 
        }
      }.getOrElse(NotFound)
      
  }

}
