package controllers.admin

import java.io.File

import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import play.api.mvc.{AnyContent, Controller}
import services.{R2PressedPageTakedownNotifier, R2PagePressNotifier}

case class R2PagePress(r2url: String) {
  def trim = this.copy(r2url = r2url.trim)
}

object R2PressController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def pressForm() = AuthActions.AuthActionTest { implicit request =>
    Ok(views.html.pressR2())
  }

  def batchUpload() = AuthActions.AuthActionTest { implicit request =>
    val body = request.body
    val uploadedFile = body.asMultipartFormData.flatMap { files =>
      files.file("r2urlfile").map { theFile =>
        val rnd = Math.random().toString.replace(".","")
        val tmpName = s"/tmp/$rnd${theFile.filename}"
        val tmpFile = new File(tmpName)
        theFile.ref.moveTo(tmpFile)
        tmpFile
      }
    }
    uploadedFile.foreach(file => pressFile(file, isBatchTakedown(body)))
    Ok(views.html.pressR2())
  }

  private def pressFile(file: File, isTakedown: Boolean): Unit = {
    val source = scala.io.Source.fromFile(file)
    try {
      source.getLines().foreach { line =>
        if (line.nonEmpty) {
          //TODO: other validation?
          if (isTakedown) {
            R2PressedPageTakedownNotifier.enqueue(line)
          } else {
            R2PagePressNotifier.enqueue(line)
          }
        }
      }
    } finally {
      source.close()
      file.delete()
    }
  }

  def press() = AuthActions.AuthActionTest { implicit request =>
    val body = request.body
    body.asFormUrlEncoded.foreach { form =>
      form("r2url").foreach { r2Url =>
        r2Url.trim match {
          // TODO: other validation?
          case url if url.nonEmpty => {
            if (isTakedown(body)) {
              R2PressedPageTakedownNotifier.enqueue(url)
            } else {
              R2PagePressNotifier.enqueue(url)
            }
          }
          case _ =>
        }
      }
    }
    SeeOther(routes.R2PressController.pressForm().url)
  }

  private def isTakedown(body: AnyContent) = {
    body.asFormUrlEncoded.flatMap { form =>
      Some(form.get("is-takedown").isDefined)
    }.getOrElse(false)
  }

  private def isBatchTakedown(body: AnyContent) = {
    body.asMultipartFormData.flatMap { form =>
      Some(form.asFormUrlEncoded.get("is-takedown").isDefined)
    }.getOrElse(false)
  }

}
