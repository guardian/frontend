package controllers.admin

import java.io.File
import java.net.URL

import common.{AkkaAsync, ImplicitControllerExecutionContext, Logging}
import model.{ApplicationContext, R2PressMessage}
import play.api.mvc._
import services.{R2PagePressNotifier, R2PressedPageTakedownNotifier}

import scala.util.{Failure, Success, Try}

class R2PressController(
  akkaAsync: AkkaAsync,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with Logging with ImplicitControllerExecutionContext {

  def pressForm(urlMsgs: List[String] = List.empty, fileMsgs: List[String] = List.empty): Action[AnyContent] = Action { implicit request =>
    Ok(views.html.pressR2(urlMsgs, fileMsgs))
  }

  def batchUpload(): Action[AnyContent] = Action { implicit request =>
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
            normaliseAndEnqueueTakedown(line)
          } else {
            normaliseAndEnqueuePress(R2PressMessage(line, isFromPreservedSource, isConvertToHttps))
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

  // NOTE: This code is copied from ArchiveController in the interest of not endlessly expanding the common
  // library. Changes made here should be reflected there - function is currently called 'normalise'
  // Our redirects are 'normalised' Vignette URLs, Ie. path/to/0,<n>,123,<n>.html -> path/to/0,,123,.html

  val R1ArtifactUrl = """^/(.*)/[0|1]?,[\d]*,(-?\d+),[\d]*(.*)""".r
  val ShortUrl = """^(/p/[\w\d]+).*$""".r


  def normalisePath(path: String): String = path match {
    case R1ArtifactUrl(p, artifactOrContextId, _) =>
      s"/$p/0,,$artifactOrContextId,.html"
    case ShortUrl(p) => p
    case _ => path
  }

  def normaliseURL(url: String):String = {
    val urlParsed = new URL(url)
    val host = urlParsed.getHost
    val path = new URL(url).getPath
    val normalisedPath = normalisePath(path)
    s"https://$host$path"
  }

  def getVariations(url: String): List[String] = {
    val urlParsed = new URL(url)
    val host = urlParsed.getHost
    val path = new URL(url).getPath
    val normalisedPath = normalisePath(path)
    List(s"https://$host$path", s"http://$host$path", s"https://$host$normalisedPath", s"http://$host$normalisedPath")
    //An http version of the redirect may exist so preemptively delete it.
  }

  private def normaliseAndEnqueueTakedown(url: String): String = {
    Try(getVariations(url)) match {
      case Success(urls) => urls.map(u => R2PressedPageTakedownNotifier.enqueue(akkaAsync)(u)).mkString("\n")
      case Failure(_) => s"$url not recognised as a valid url."
    }
  }

  def normaliseAndEnqueuePress(message: R2PressMessage): String = {
    val tryUrl = Try(normaliseURL(message.url))
    tryUrl match {
      case Success(url) => R2PagePressNotifier.enqueue(akkaAsync)(message.copy(url = url))
      case Failure(_) => s"${message.url} not recognised as a valid url."
    }
  }

  def press(): Action[AnyContent] = Action { implicit request =>
    val body = request.body
    val result = body.asFormUrlEncoded.map { form =>
      form("r2url").map{ r2Url =>
        r2Url.trim match {
          // TODO: other validation?
          case url if url.nonEmpty =>
            if (isTakedown(body)) {
              normaliseAndEnqueueTakedown(url)
            } else {
              normaliseAndEnqueuePress(R2PressMessage(url, isFromPreservedSource(body), isConvertToHttps(body)))
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
