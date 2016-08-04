package controllers.admin

import java.io.File

import play.api.mvc.Controller
import common.Logging
import play.api.data._
import play.api.data.Forms._
import services.Redirects


case class PageRedirect(from: String, to: String) {
  lazy val trim = this.copy(from = from.trim, to = to.trim)
}
class RedirectController  extends Controller with Logging {


  val redirectForm = Form(mapping("from" -> text, "to" -> text)(PageRedirect.apply)(PageRedirect.unapply))

  def redirect() = AuthActions.AuthActionTest { implicit request =>
    Ok(views.html.redirects(redirectForm))
  }

  def redirectPost() = AuthActions.AuthActionTest { implicit request =>

    redirectForm.bindFromRequest().get.trim match {
      case PageRedirect(from, "") if from.nonEmpty  => Redirects.remove(from)
      case PageRedirect(from, to) if from.nonEmpty  => Redirects.set(from, to)
      case _ =>
    }

    SeeOther(routes.RedirectController.redirect().url)
  }

  def redirectBatchPost() = AuthActions.AuthActionTest { implicit request =>

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
            Redirects.set(from, to)
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
