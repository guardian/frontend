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
    redirects
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
 
  // TODO - 1) fix non-relative URLs, 2) patch gallery URLs, 3)   

  def lookup(path: String) = Action { implicit request =>
   
    isEncoded(path)
      .map {
        url => Redirect(s"http://${url}", 301)
      }.orElse {
        isRedirect(normalise(path).getOrElse(path)).map {
          url => Redirect(url, 301)
        }
      }.orElse {
        isArchived(normalise(path, zeros = "00").getOrElse(path)).map {
          body => Ok(views.html.archive(s"${body}")).as("text/html")
        }
      }.orElse {
        isGallery(path).map {
          url => Redirect(s"http://${url}", 301) 
        }
      }.getOrElse(NotFound)
      
  }

}
