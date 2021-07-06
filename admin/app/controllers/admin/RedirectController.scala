package controllers.admin

import common.GuLogging
import model.ApplicationContext
import play.api.data.Forms._
import play.api.data._
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services.RedirectService
import services.RedirectService.{PermanentRedirect => GuardianRedirect}

import java.io.File

case class PageRedirect(from: String, to: String) {
  lazy val trim = this.copy(from = from.trim, to = to.trim)
}
class RedirectController(
    redirects: RedirectService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging {

  val redirectForm = Form(mapping("from" -> text, "to" -> text)(PageRedirect.apply)(PageRedirect.unapply))

  def redirect(): Action[AnyContent] =
    Action { implicit request =>
      Ok(views.html.redirects(redirectForm))
    }

  def redirectPost(): Action[AnyContent] =
    Action { implicit request =>
      val failMessage = "Request failed, please ensure you have followed the instructions and try again."

      val message = redirectForm.bindFromRequest().get.trim match {
        case PageRedirect(from, "") if from.nonEmpty =>
          val success = redirects.remove(from)
          if (success) "Redirect successfully removed" else failMessage
        case PageRedirect(from, to) if from.nonEmpty =>
          val success = redirects.set(GuardianRedirect(from, to))
          if (success) "Redirect successfully set" else failMessage
        case _ => failMessage
      }

      Ok(views.html.redirects(redirectForm, urlMsgs = List(message)))
    }

  def redirectBatchPost(): Action[AnyContent] =
    Action { implicit request =>
      val body = request.body
      val uploadedFile = body.asMultipartFormData.flatMap { files =>
        files.file("urlfile").map { theFile =>
          val rnd = Math.random().toString.replace(".", "")
          val tmpName = s"/tmp/$rnd${theFile.filename}"
          val tmpFile = new File(tmpName)
          theFile.ref.moveTo(tmpFile)
          tmpFile
        }
      }
      val msgs = if (uploadedFile.nonEmpty) {
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
      source
        .getLines()
        .map { line =>
          if (line.nonEmpty) {
            val fromAndTo = line.split("\t")
            val from = fromAndTo(0).trim
            val to = fromAndTo(1).trim
            try {
              redirects.set(GuardianRedirect(from, to))
              s"$from -> $to"
            } catch {
              case e: Exception => s"Error processing $line: ${e.getMessage}"
            }
          } else {
            "* empty input line *"
          }
        }
        .toList
    } finally {
      source.close()
      file.delete()
    }
  }

}
