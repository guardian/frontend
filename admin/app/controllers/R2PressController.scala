package controllers.admin

import java.io.File

import common.{AkkaAsync, ExecutionContexts, Logging}
import model.R2PressMessage
import play.api.mvc.{Action, AnyContent, Controller}
import services.{R2PagePressNotifier, R2PressedPageTakedownNotifier}

class R2PressController(akkaAsync: AkkaAsync) extends Controller with Logging with ExecutionContexts {

  def pressForm(urlMsgs: List[String] = List.empty, fileMsgs: List[String] = List.empty) = Action { implicit request =>
    Ok(views.html.pressR2(urlMsgs, fileMsgs))
  }

  def batchUpload() = Action { implicit request =>
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
    val msgs = if(uploadedFile.nonEmpty) {
      val results = uploadedFile.map(file => {
        try {
          pressFile(file, isBatchTakedown(body), isBatchFromPreservedSource(body), isBatchConvertToHttps(body))
        } catch {
          case e: Exception => List(s"Error processing ${file.getName} - ${e.getMessage}")
        }
      })
      List(s"File uploaded as ${uploadedFile.map(_.getName).getOrElse("")}") ::: results.getOrElse(List.empty)
    } else {
      List("File was not uploaded")
    }

    Ok(views.html.pressR2(fileMsgs = msgs))
  }

  private def pressFile(file: File, isTakedown: Boolean, isFromPreservedSource: Boolean, isConvertToHttps: Boolean): List[String] = {
    val source = scala.io.Source.fromFile(file)
    try {
      source.getLines().map { line =>
        if (line.nonEmpty) {
          //TODO: other validation?
          if (isTakedown) {
            R2PressedPageTakedownNotifier.enqueue(akkaAsync)(line)
          } else {
            R2PagePressNotifier.enqueue(akkaAsync)(R2PressMessage(line, isFromPreservedSource, isConvertToHttps))
          }
        } else {
          "* empty line *"
        }
      }.toList
    } finally {
      source.close()
      file.delete()
    }
  }

  def press() = Action { implicit request =>
    val body = request.body
    val result = body.asFormUrlEncoded.map { form =>
      form("r2url").map { r2Url =>
        r2Url.trim match {
          // TODO: other validation?
          case url if url.nonEmpty => {
            if (isTakedown(body)) {
              R2PressedPageTakedownNotifier.enqueue(akkaAsync)(url)
            } else {
              R2PagePressNotifier.enqueue(akkaAsync)(R2PressMessage(url, isFromPreservedSource(body), isConvertToHttps(body)))
            }
          }
          case _ => "URL was not specified"
        }
      }
    }.map(_.toList).getOrElse(List.empty)
    Ok(views.html.pressR2(urlMsgs = result))
  }

  private def isTakedown(body: AnyContent) = {
    body.asFormUrlEncoded.flatMap { form =>
      Some(form.get("is-takedown").isDefined)
    }.getOrElse(false)
  }

  private def isFromPreservedSource(body: AnyContent) = {
    body.asFormUrlEncoded.flatMap { form =>
      Some(form.get("is-from-preserved-source").isDefined)
    }.getOrElse(false)
  }

  private def isConvertToHttps(body: AnyContent) = {
    body.asFormUrlEncoded.flatMap { form =>
      Some(form.get("is-convert-to-https").isDefined)
    }.getOrElse(false)
  }

  private def isBatchTakedown(body: AnyContent) = {
    body.asMultipartFormData.flatMap { form =>
      Some(form.asFormUrlEncoded.get("is-takedown").isDefined)
    }.getOrElse(false)
  }

  private def isBatchFromPreservedSource(body: AnyContent) = {
    body.asMultipartFormData.flatMap { form =>
      Some(form.asFormUrlEncoded.get("is-from-preserved-source").isDefined)
    }.getOrElse(false)
  }

  private def isBatchConvertToHttps(body: AnyContent) = {
    body.asMultipartFormData.flatMap { form =>
      Some(form.asFormUrlEncoded.get("is-convert-to-https").isDefined)
    }.getOrElse(false)
  }

}
