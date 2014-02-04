package controllers

import common._
import play.api.mvc._
import views.support.RenderOtherStatus
import views.support._
import play.api.libs.ws._
import scala.io.Source
import services.S3
import play.api.templates.Html

// looks for an archived file in S3 bucket
object S3Yonder extends S3 {
 override lazy val bucket = "aws-frontend-archive"
 def getHtml(path: String) = get(path) 
}

object ArchiveController extends Controller with Logging with ExecutionContexts {
 
  // A big _database_ of redirects that will some day live in the Content API
  def isRedirect(path: String) = Source.fromFile("resources/redirects__1000-lines").getLines.contains(path) 

  // do we have an archived copy of this resource? 
  def existsInS3(path: String) = S3Yonder.getHtml(path)  

  //  
  def archive(path: String) = Action { implicit request =>
   
    val subDomain = request.headers("Host").split("""\.""")(0)
    val host = s"""$subDomain.theguardian.com/"""

    // redirect -> 301? s3 -> 200? no -> then 404. 
    isRedirect(s"""$subDomain/$path""") match { 
      case true => Ok("301")
      case _ => {  
        val s3content = existsInS3(s"""$host$path""")
        s3content match {
          case _: Option[String] => Ok(s3content.get).as("text/html")
          case _ => Ok("404") 
        }
      } 
    }
  }
}
