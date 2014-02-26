package controllers

import common._
import play.api.mvc._
import views.support.RenderOtherStatus
import views.support._
import services.S3
import services.DynamoDB
import play.api.templates.Html
import java.net.{URLDecoder, URLEncoder}

object ArchiveController extends Controller with Logging with ExecutionContexts {
 
  def isRedirect(path: String) = {
    val redirects = DynamoDB.destinationFor(path)
    log.info(s"Checking '${path}' is a redirect in DynamoDB: ${!redirects.isEmpty}")
    redirects
  }

  def isArchived(path: String) = {
    val archive = services.S3Archive.getHtml(path)
    log.info(s"Checking '${path}' is a archived in S3: ${!archive.isEmpty}")
    archive
  }

  def isEncoded(path: String) = {
    val decodedPath = URLDecoder.decode(path, "UTF-8")
    if (decodedPath != path) Some(decodedPath) else None
  } 

  // Our redirects are 'normalised' Vignette URLs, Ie. path/to/0,<n>,123,<n>.html -> path/to/0,,123,.html
  def normalise(path: String, zeros: String = "") = {
    val r1ArtifactUrl = """www.theguardian.com/(.*)/[0|1]?,[\d]*,(-?\d+),[\d]*(.*)""".r
    path match {
      case r1ArtifactUrl(path, artifactOrContextId, extension) => {
        val normalisedUrl = s"www.theguardian.com/${path}/0,,${artifactOrContextId},${zeros}.html"
        Some(normalisedUrl)
      }
      case _ => None
    }
  }
  
  def lookup(path: String) = Action { implicit request =>
   
    val encoded = isEncoded(path)

    // is it a redirect -> 301, if not is it archived -> 200, if not then 404
    encoded match {
      case Some(_) => Redirect(s"http://${encoded.get}", 301)
      case _ => {
        val destination = isRedirect(normalise(path).getOrElse(path))
        destination match { 
          case Some(_) => Redirect(destination.get, 301)
          case _ => {
            val s3content = isArchived(normalise(path, zeros = "00").getOrElse(path))
            s3content match {
              case Some(_) => Ok(views.html.archive(s3content)).as("text/html")
              case _ => NotFound
            }
          } 
        }
      }
    }
  }

}
