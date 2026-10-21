package model

import play.api.libs.json.{JsObject, Json, Writes}
import services.eventgraphic.{EventGraphicSource, GraphicKind}

import java.net.URI

case class AppComponent(id: String, cacheTime: CacheTime) extends StandalonePage {
  override def metadata: MetaData = MetaData.make(
    id = id,
    section = None,
    webTitle = s"App Component",
    cacheTime = Some(cacheTime),
  )
}

sealed trait ComponentType {
  def id: String
}

final case class EventGraphic private (id: String) extends ComponentType

object EventGraphic {
  def fromId(id: String): Option[EventGraphic] =
    Option.when(EventGraphicSource.isSupported(id))(EventGraphic(id))
}

final case class Thrasher(id: String) extends ComponentType

trait ComponentDataModel {
  def page: AppComponent
}

object ComponentDataModel {
  implicit val writes: Writes[ComponentDataModel] = Writes {
    case EventGraphicDataModel(_, eventData, config, graphicKind, dataUrl) =>
      Json.obj("config" -> config, "graphicKind" -> graphicKind, "dataUrl" -> dataUrl) ++ Json.obj(
        "eventData" -> eventData,
      )
    case _: ThrasherDataModel => JsObject.empty
  }
}

case class EventGraphicDataModel(
    page: AppComponent,
    eventData: JsObject,
    config: JsObject,
    graphicKind: Option[GraphicKind],
    dataUrl: Option[URI],
) extends ComponentDataModel
case class ThrasherDataModel(page: AppComponent) extends ComponentDataModel
