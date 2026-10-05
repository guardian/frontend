package controllers

import common._
import implicits.{AppsFormat, JsonFormat}
import model.dotcomrendering.DotcomRenderingConfig
import model.{
  AppComponent,
  CacheTime,
  Cached,
  ComponentDataModel,
  ComponentType,
  EventGraphic,
  EventGraphicDataModel,
  Thrasher,
  ThrasherDataModel,
}
import play.api.libs.json.{JsObject, Json}
import play.api.libs.ws.WSClient
import play.api.mvc._
import services.eventgraphic.{EventGraphicService, EventGraphicSource}

import java.net.URI
import scala.concurrent.Future

class ComponentController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    val eventGraphicService: EventGraphicService,
    remoteRenderer: renderers.DotcomRenderingService,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderJson(path: String): Action[AnyContent] = render(path)
  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      getComponentModel(path)
        .flatMap { model =>
          request.getRequestFormat match {
            case JsonFormat =>
              Future.successful(Cached(model.page.cacheTime)(JsonComponent.fromWritable(model)))
            // only supported for dcr=apps\
            case AppsFormat =>
              remoteRenderer.getAppsComponent(wsClient, Json.toJson(model), model.page.cacheTime)
            case _ => Future.successful(NotFound)
          }
        }
        .recover { case _: NoSuchElementException => NotFound }
    }

  private def getComponentModel(path: String)(implicit request: RequestHeader): Future[ComponentDataModel] = {
    getComponentType(path) match {
      case Some(EventGraphic(id)) =>
        val component = AppComponent(id, CacheTime.Component)
        val config = DotcomRenderingConfig(
          page = component,
          request = request,
          isPreview = false,
        )

        EventGraphicSource.byId(id) match {
          case Some(source) =>
            getEventGraphic(id, source.fullUrl).map { eventData =>
              EventGraphicDataModel(component, eventData, config, Some(source.graphicKind), Some(source.fullUrl))
            }
          case None =>
            Future.failed(new NoSuchElementException(s"Event graphic source not found for id: $id"))
        }
      case Some(Thrasher(id)) =>
        val component = AppComponent(id, CacheTime.Component)
        Future.successful(ThrasherDataModel(component))
      case None =>
        Future.failed(new NoSuchElementException(s"Component type not found for path: $path"))
    }
  }

  private def getEventGraphic(id: String, sourceUrl: URI): Future[JsObject] =
    eventGraphicService.getData(sourceUrl.getPath).flatMap {
      case Right(result) => Future.successful(result)
      case Left(error)   =>
        Future.failed(new Exception(s"Failed to fetch data for event graphic $id: ${error.message}"))
    }

  private[controllers] def getComponentType(path: String): Option[ComponentType] =
    path.split("/", 2).toList match {
      // Only a limited set of event graphics are accepted
      case "event-graphic" :: id :: Nil => EventGraphic.fromId(id)
      // Any thrasher id is accepted
      case "thrasher" :: id :: Nil if id.nonEmpty => Some(Thrasher(id))
      case _                                      => None
    }
}
