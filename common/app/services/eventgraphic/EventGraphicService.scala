package services.eventgraphic

import conf.Configuration
import play.api.libs.json._
import services.zug.{ZugClient, ZugClientError}

import java.net.URI
import scala.concurrent.{ExecutionContext, Future}

sealed abstract class GraphicKind(val value: String)
object GraphicKind {
  case object ElectionTracker extends GraphicKind("electionTracker")
  // Add future kinds here, e.g. case object Football extends EventKind("football")

  val all: Seq[GraphicKind] = Seq(ElectionTracker)

  def fromString(value: String): Option[GraphicKind] = all.find(_.value == value)

  implicit val format: Format[GraphicKind] = new Format[GraphicKind] {
    override def writes(kind: GraphicKind): JsValue = JsString(kind.value)

    override def reads(json: JsValue): JsResult[GraphicKind] =
      json.validate[String].flatMap { value =>
        fromString(value).fold[JsResult[GraphicKind]](JsError(s"Unknown EventKind: $value"))(JsSuccess(_))
      }
  }
}

case class EventGraphicSource(fullUrl: URI, graphicKind: GraphicKind)

object EventGraphicSource {
  val host = s"${Configuration.zugApi.host.stripSuffix("/")}"
  private val sources: Map[String, EventGraphicSource] = Map(
    "us-midterms-2026" -> EventGraphicSource(
      fullUrl = new URI(s"$host/election-tracker/us-midterms-2026"),
      graphicKind = GraphicKind.ElectionTracker,
    ),
  )

  def byId(id: String): Option[EventGraphicSource] = sources.get(id)
}

class EventGraphicService(zugClient: ZugClient)(implicit executionContext: ExecutionContext) {
  def getData(path: String): Future[Either[ZugClientError, JsObject]] = {
    zugClient.get(path)
  }
}
