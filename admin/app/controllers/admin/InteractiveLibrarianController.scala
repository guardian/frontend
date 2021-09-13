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
)(implicit context: ApplicationContext, mat: Materializer)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  val events = Source.queue[PressResult](bufferSize = 100)
  val (queue, _) = events.preMaterialize()

  def pressForm(urlMsgs: List[String] = List.empty, fileMsgs: List[String] = List.empty): Action[AnyContent] =
    Action { implicit request =>
      Ok(views.html.pressInteractive(urlMsgs, fileMsgs))
    }

  def press(): Action[AnyContent] =
    Action { implicit request =>
      // return pressInteractiveWaiting page (prevent form resubmission)

      // start async process
      // when async process complete return to pressInteractive page

      val body = request.body
      val result = body.asFormUrlEncoded
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
                    "Pressed successfully!"
                  } else {
                    errorMsg // TODO make this better
                  }
                }

                result.onComplete({
                  case scala.util.Success(_)     => queue.offer(Success(path))
                  case scala.util.Failure(error) => queue.offer(Failure(path, error))
                }) // add to events queue

                s"$path has been queued for pressing..."

              case _ => "URL not specified"
            }
          }
        }
        .map(_.toList)
        .getOrElse(List.empty)
      println(s"results ${result}")
      Ok(views.html.pressInteractive())
    }

  // Returns events for a pressed path. I.e. 'success' or some kind of failure.
  def pressStatusUpdates(path: String): Action[AnyContent] =
    Action { implicit request =>
      val relevantEvents = events.filter(_.path == path)

      Ok.chunked(relevantEvents via EventSource.flow)
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
