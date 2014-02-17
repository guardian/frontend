package controllers

import common._
import play.api.mvc._
import views.support.RenderOtherStatus
import views.support._
import services.S3
import services.DynamoDB
import play.api.templates.Html

//import play.api.libs.ws._

// looks for an archived file in S3 bucket

object S3Archive extends S3 {
 override lazy val bucket = "aws-frontend-archive"
 def getHtml(path: String) = get(path) 
}


object ArchiveController extends Controller with Logging with ExecutionContexts {
 
  // ...
  def isRedirect(path: String) = DynamoDB.destinationFor(path)

  // do we have an archived copy of this resource? 
  def existsInS3(path: String) = S3Archive.getHtml(path)

  // gets  
  def render(path: String) = Action { implicit request =>
  
    val destination = isRedirect(path)

    // redirect -> 301? s3 -> 200? no -> then 404.
    destination match { 
      case Some(_) => Redirect(destination.get)
      case _ => {

        val s3content = existsInS3(path)
        s3content match {
          case Some(_) => Ok(s3content.get).as("text/html")
          case _ => Ok("404") 
        }

      } 
    }
  }
}
