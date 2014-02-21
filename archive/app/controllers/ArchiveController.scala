package controllers

import common._
import play.api.mvc._
import views.support.RenderOtherStatus
import views.support._
import services.S3
import services.DynamoDB
import play.api.templates.Html

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

  // Our redirects are 'normalised' Vignette URLs - @obrienm understands this
  def normalise(path: String) = {
    val r1ArtifactUrl = """www.theguardian.com/(.*)/[0|1]?,[\d+]?,(-?\d+),[\d+]?(.*)""".r
    path match {
      case r1ArtifactUrl(path, artifactOrContextId, extension) => {
        val normalisedUrl = s"www.theguardian.com/${path}/0,,${artifactOrContextId},.html"
        Some(normalisedUrl)
      }
      case _ => None
    }
  }
  
  def lookup(path: String) = Action { implicit request =>
  
    val destination = isRedirect(normalise(path).getOrElse(path))

    // is it a redirect -> 301, if not is it archived -> 200, if not then 404
    destination match { 
      case Some(_) => Redirect(destination.get)
      case _ => {
        val s3content = isArchived(path)
        s3content match {
          case Some(_) => Ok(s3content.get).as("text/html")
          case _ => NotFound
        }
      } 
    }
  }
}
