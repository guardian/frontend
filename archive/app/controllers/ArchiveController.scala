package controllers

import common._
import play.api.mvc._
import views.support.RenderOtherStatus
import views.support._
import services.S3
import services.DynamoDB
import play.api.templates.Html

object ArchiveController extends Controller with Logging with ExecutionContexts {
 
  def isRedirect(path: String) = DynamoDB.destinationFor(path)

  def isArchived(path: String) = services.S3Archive.getHtml(path)

  def lookup(path: String) = Action { implicit request =>
  
    val destination = isRedirect(path)

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
