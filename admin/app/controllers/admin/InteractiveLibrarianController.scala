package controllers.admin

import akka.stream.scaladsl.Source
import common.{AkkaAsync, GuLogging, ImplicitControllerExecutionContext}
import conf.switches.Switches.InteractiveLibrarianAdminRoutes
import model.ApplicationContext
import play.api.http.ContentTypes
import play.api.libs.EventSource
import play.api.libs.EventSource.EventDataExtractor
import play.api.libs.ws.WSClient
import play.api.mvc._
import services.dotcomrendering.InteractiveLibrarian

import scala.concurrent.Future
import java.net.URL
import scala.util.Try
import akka.stream.Materializer
import akka.http.scaladsl.model.headers.LinkParams

sealed trait PressResult { val path: String }
final case class Success(path: String) extends PressResult
final case class Failure(path: String, error: Throwable) extends PressResult

object PressResult {
  implicit val pressResultEvents: EventDataExtractor[PressResult] = EventDataExtractor({
    case Success(path)        => s"Press succeeded for path: '$path'."
    case Failure(path, error) => s"Press failed for path: '$path'. Error was: ${error.getMessage}."
  })
}

class InteractiveLibrarianController(
  wsClient: WSClient,
  akkaAsync: AkkaAsync,
  val controllerComponents: ControllerComponents,
  )(implicit context: ApplicationContext, materializer: Materializer)
  extends BaseController
  with GuLogging
  with ImplicitControllerExecutionContext {

  val sourceQueue = Source.queue[PressResult](bufferSize = 100)
  val (queue, source) = sourceQueue.preMaterialize()

  def pressForm(urlMsgs: List[String] = List.empty, fileMsgs: List[String] = List.empty): Action[AnyContent] =
    Action { implicit request =>
      Ok(views.html.pressInteractive(urlMsgs, fileMsgs))
    }

  def press(): Action[AnyContent] =
    Action { implicit request =>
      val body = request.body

      // for now repeating the function to extract path so i don't
      // break the below, but also have a path to pass to the page
      // that displays the waiting state
      val path = body.asFormUrlEncoded.map { form =>
        form("interactiveUrl").map { interactiveUrl =>
          interactiveUrl.trim match {
            case url if url.nonEmpty => getPath(url)
            case _ => "Please specify a URL"
          }
        }
      }

      println(s"path ${path}")

      body.asFormUrlEncoded
        .map { form =>
          form("interactiveUrl").map { interactiveUrl =>
            interactiveUrl.trim match {
              case url if url.nonEmpty =>
                val path = getPath(url)

                val result = for {
                  _ <- InteractiveLibrarian.pressLiveContents(wsClient, path)
                  (ok, errorMsg) = InteractiveLibrarian.readCleanWrite(path)
                } yield {
                  if (ok) {
                    println("press success")
                    "Pressed successfully!"
                  } else {
                    errorMsg // TODO make this better
                  }
                }

                result.onComplete({
                  case scala.util.Success(_)     => {
                    println(s"on complete, about to offer success to queue, $path")
                    val status = queue.offer(Success(path))

                    println(s"status of offering ${status}")
                  }
                  case scala.util.Failure(error) => {
                    println(s"on complete, about to offer failure to queue, $path")
                    queue.offer(Failure(path, error))
                  }
                }) // add to events queue

                s"$path has been queued for pressing..."

              case _ => "URL not specified"
            }
          }
        }
        .map(_.toList)
        .getOrElse(List.empty)

        // return page where we wait for results, or offer to press another page
        // page we display must have js included to listen to events
        Ok(views.html.pressInteractiveWaiting(path = path))
    }

  // Returns events for a pressed path. I.e. 'success' or some kind of failure.
  def pressStatusUpdates(path: String): Action[AnyContent] =
    Action { implicit request =>
      val formattedPath = s"/$path"

      // val relevantEvents = events.filter(_.path == formattedPath)
      // val res = queue.offer(Success(path))
      // println(s"press status queue offer res ${res}")
      // println(s"path used to get events ${formattedPath}")
      Ok.chunked(source via EventSource.flow)
        .as(ContentTypes.EVENT_STREAM)
        .withHeaders("Cache-Control" -> "no-cache")
        .withHeaders("Connection" -> "keep-alive")
    }

  def getPath(url: String): String = {
    (new URL(url)).getPath()
  }

  def liveContentsPress(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      if (InteractiveLibrarianAdminRoutes.isSwitchedOn) {
        InteractiveLibrarian.pressLiveContents(wsClient, path).map { message =>
          Ok(message)
        }
      } else {
        Future.successful(NotFound)
      }
    }
  }

  def readCleanWrite(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      if (InteractiveLibrarianAdminRoutes.isSwitchedOn) {
        val status = InteractiveLibrarian.readCleanWrite(path)
        Future.successful(Ok(status.toString()))
      } else {
        Future.successful(NotFound)
      }
    }
  }
}
