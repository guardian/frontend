package controllers.admin

import common.{GuLogging, ImplicitControllerExecutionContext, PekkoAsync}
import model.{ApplicationContext, R2PressMessage}
import play.api.mvc._
import services.{R2PagePressNotifier, R2PressedPageTakedownNotifier, RedirectService}

import java.io.File
import java.net.URI
import scala.util.Try

class R2PressController(
    pekkoAsync: PekkoAsync,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def pressForm(urlMsgs: List[String] = List.empty, fileMsgs: List[String] = List.empty): Action[AnyContent] =
    Action { implicit request =>
      Ok(views.html.pressR2(urlMsgs, fileMsgs))
    }

  def batchUpload(): Action[AnyContent] =
    Action { implicit request =>
      val body = request.body
      val uploadedFile = body.asMultipartFormData.flatMap { files =>
        files.file("r2urlfile").map { theFile =>
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
            pressFile(file, isBatchTakedown(body), isBatchConvertToHttps(body))
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

  private def pressFile(
      file: File,
      isTakedown: Boolean,
      isConvertToHttps: Boolean,
  ): List[String] = {
    val source = scala.io.Source.fromFile(file)
    try {
      source
        .getLines()
        .map { line =>
          if (line.nonEmpty) {
            // TODO: other validation?
            if (isTakedown) {
              normaliseAndEnqueueTakedown(line)
            } else {
              normaliseAndEnqueuePress(R2PressMessage(line, isConvertToHttps))
            }
          } else {
            "* empty line *"
          }
        }
        .toList
    } finally {
      source.close()
      file.delete()
    }
  }

  def getVariations(url: String): Option[List[String]] = {
    Try(new URI(url).toURL).toOption.map { url =>
      val host = url.getHost
      val path = url.getPath
      val normalisedPath = RedirectService.normalisePath(path)
      List(s"https://$host$path", s"http://$host$path", s"https://$host$normalisedPath", s"http://$host$normalisedPath")
      // An http version of the redirect may exist so preemptively delete it.
    }
  }

  private def normaliseAndEnqueueTakedown(url: String): String = {
    getVariations(url) match {
      case Some(urls) => urls.map(u => R2PressedPageTakedownNotifier.enqueue(pekkoAsync)(u)).mkString("\n")
      case None       => s"$url not recognised as a valid url."
    }
  }

  def normaliseAndEnqueuePress(message: R2PressMessage): String = {
    val tryUrl = RedirectService.normaliseURL(message.url)
    tryUrl match {
      case Some(url) => R2PagePressNotifier.enqueue(pekkoAsync)(message.copy(url = url))
      case None      => s"${message.url} not recognised as a valid url."
    }
  }

  def press(): Action[AnyContent] =
    Action { implicit request =>
      val body = request.body
      val result = body.asFormUrlEncoded
        .map { form =>
          form("r2url").map { r2Url =>
            r2Url.trim match {
              // TODO: other validation?
              case url if url.nonEmpty =>
                if (isTakedown(body)) {
                  normaliseAndEnqueueTakedown(url)
                } else {
                  normaliseAndEnqueuePress(R2PressMessage(url, isConvertToHttps(body)))
                }
              case _ => "URL was not specified"
            }
          }
        }
        .map(_.toList)
        .getOrElse(List.empty)
      Ok(views.html.pressR2(urlMsgs = result))
    }

  private def isTakedown(body: AnyContent) = {
    body.asFormUrlEncoded
      .flatMap { form =>
        Some(form.get("is-takedown").isDefined)
      }
      .getOrElse(false)
  }

  private def isConvertToHttps(body: AnyContent) = {
    body.asFormUrlEncoded
      .flatMap { form =>
        Some(form.get("is-convert-to-https").isDefined)
      }
      .getOrElse(false)
  }

  private def isBatchTakedown(body: AnyContent) = {
    body.asMultipartFormData
      .flatMap { form =>
        Some(form.asFormUrlEncoded.get("is-takedown").isDefined)
      }
      .getOrElse(false)
  }

  private def isBatchConvertToHttps(body: AnyContent) = {
    body.asMultipartFormData
      .flatMap { form =>
        Some(form.asFormUrlEncoded.get("is-convert-to-https").isDefined)
      }
      .getOrElse(false)
  }

}
