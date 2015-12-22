package controllers.admin

import java.io.File

import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import play.api.data.Form
import play.api.data.Forms._
import play.api.mvc.Controller
import services.R2PagePressNotifier

case class R2PagePress(r2url: String) {
  lazy val trim = this.copy(r2url = r2url.trim)
}

object R2PressController extends Controller with Logging with AuthLogging with ExecutionContexts {

  val pressPageForm = Form(mapping("r2url" -> text)(R2PagePress.apply)(R2PagePress.unapply))

  def pressForm() = AuthActions.AuthActionTest { implicit request =>
    Ok(views.html.pressR2(pressPageForm))
  }

  def batchUpload() = AuthActions.AuthActionTest { implicit request =>
    val uploadedFile = request.body.asMultipartFormData.flatMap { files =>
      files.file("r2urlfile").map { theFile =>
        val rnd = Math.random().toString.replace(".","")
        val tmpName = s"/tmp/$rnd${theFile.filename}"
        val tmpFile = new File(tmpName)
        theFile.ref.moveTo(tmpFile)
        tmpFile
      }
    }
    uploadedFile.foreach(pressFile)
    Ok(views.html.pressR2(pressPageForm))
  }

  private def pressFile(file: File): Unit = {
    val source = scala.io.Source.fromFile(file)
    val lines = try {
      source.getLines().foreach { line =>
        if (line.nonEmpty) {
          //TODO: validation?
          R2PagePressNotifier.enqueue(line)
        }
      }
    } finally {
      source.close()
      file.delete()
    }
  }

  def press() = AuthActions.AuthActionTest { implicit request =>
    pressPageForm.bindFromRequest().get.trim match {
      case R2PagePress(r2url) if r2url.nonEmpty  => R2PagePressNotifier.enqueue(r2url)
      case _ =>
    }

    SeeOther(routes.R2PressController.pressForm().url)
  }

}
