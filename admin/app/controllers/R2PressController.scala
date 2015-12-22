package controllers.admin

import java.io.File

import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import play.api.mvc.Controller
import services.R2PagePressNotifier

case class R2PagePress(r2url: String) {
  def trim = this.copy(r2url = r2url.trim)
}

object R2PressController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def pressForm() = AuthActions.AuthActionTest { implicit request =>
    Ok(views.html.pressR2())
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
    Ok(views.html.pressR2())
  }

  private def pressFile(file: File): Unit = {
    val source = scala.io.Source.fromFile(file)
    val lines = try {
      source.getLines().foreach { line =>
        if (line.nonEmpty) {
          //TODO: other validation?
          R2PagePressNotifier.enqueue(line)
        }
      }
    } finally {
      source.close()
      file.delete()
    }
  }

  def press() = AuthActions.AuthActionTest { implicit request =>
    request.body.asFormUrlEncoded.foreach { form =>
      form("r2url").foreach { r2Url =>
        r2Url.trim match {
          // TODO: other validation?
          case url if url.nonEmpty => R2PagePressNotifier.enqueue(url)
          case _ =>
        }
      }
    }
    SeeOther(routes.R2PressController.pressForm().url)
  }

}
