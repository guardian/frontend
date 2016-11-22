package controllers.admin

import java.io.File

import play.api.mvc.{Action, Controller}
import common.Logging
import play.api.data._
import play.api.data.Forms._
import services.RedirectService.PermanentRedirect
import services.RedirectService

import scala.util.Success


case class PageRedirect(from: String, to: String) {
  lazy val trim = this.copy(from = from.trim, to = to.trim)
}
class RedirectController(redirects: RedirectService) extends Controller with Logging {


  val redirectForm = Form(mapping("from" -> text, "to" -> text)(PageRedirect.apply)(PageRedirect.unapply))

  def redirect() = Action { implicit request =>
    Ok(views.html.redirects(redirectForm))
  }

  def redirectPost() = Action { implicit request =>
    val failMessage = "Request failed, please ensure you have followed the instructions and try again."

    val message = redirectForm.bindFromRequest().get.trim match {
      case PageRedirect(from, "") if from.nonEmpty  =>
        redirects.remove(from) match {
          case Success(_) => "Redirect successfully removed"
          case _ => failMessage
        }
      case PageRedirect(from, to) if from.nonEmpty  =>
        redirects.set(PermanentRedirect(from, to)) match {
          case Success(_) => "Redirect successfully set"
          case _ => failMessage
        }
      case _ => failMessage
    }

    Ok(views.html.redirects(redirectForm, urlMsgs = List(message)))
  }

  def redirectBatchPost() = Action { implicit request =>

    val body = request.body
    val uploadedFile = body.asMultipartFormData.flatMap { files =>
      files.file("urlfile").map { theFile =>
        val rnd = Math.random().toString.replace(".","")
        val tmpName = s"/tmp/$rnd${theFile.filename}"
        val tmpFile = new File(tmpName)
        theFile.ref.moveTo(tmpFile)
        tmpFile
      }
    }
    val msgs = if(uploadedFile.nonEmpty) {
      val results = uploadedFile.map(file => {
        try {
          redirectFile(file)
        } catch {
          case e: Exception => List(s"Error processing ${file.getName} - ${e.getMessage}")
        }
      })
      List(s"File uploaded as ${uploadedFile.map(_.getName).getOrElse("")}") ::: results.getOrElse(List.empty)
    } else {
      List("File was not uploaded")
    }

    Ok(views.html.redirects(redirectForm, fileMsgs = msgs))

  }

  private def redirectFile(file: File): List[String] = {
    val source = scala.io.Source.fromFile(file)
    try {
      source.getLines().map { line =>
        if (line.nonEmpty) {
          val fromAndTo = line.split("\t")
          val from = fromAndTo(0).trim
          val to = fromAndTo(1).trim
          try {
            redirects.set(PermanentRedirect(from, to))
            s"$from -> $to"
          } catch {
            case e: Exception => s"Error processing $line: ${e.getMessage}"
          }
        } else {
          "* empty input line *"
        }
      }.toList
    } finally {
      source.close()
      file.delete()
    }
  }

}
