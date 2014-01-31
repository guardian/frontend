package controllers.front

import model._
import scala.concurrent.Future
import play.api.libs.ws.{Response, WS}
import play.api.libs.json.{JsValue, Json}
import common.ExecutionContexts
import model.FaciaPage

trait FrontJson extends ExecutionContexts {

  val bucketAddress: String = ""

  def getAddressForPath(path: String): String = s"$bucketAddress/$path/pressed.json"

  def get(path: String): Future[Option[FaciaPage]] = {
    val response = WS.url(getAddressForPath(path)).get()
    parseResponse(response)
  }

  private def parseCollection(json: JsValue): Collection = {
    val curated = (json \ "curated").asOpt[List[JsValue]].getOrElse(Nil)
    val trails = curated.flatMap(Content.fromPressedJsonByDelegate)
    Collection(trails)
  }

  private def parseOutTuple(json: JsValue): List[(Config, Collection)] = {
    (json \ "collections").as[List[Map[String, JsValue]]].flatMap { m =>
      m.map { case (id, j) =>
        (Config(id), parseCollection(j))
      }
    }
  }

  private def parsePressedJson(j: String): Option[FaciaPage] = {
    val json = Json.parse(j)
    Option(
      FaciaPage(
        (json \ "id").as[String],
        parseOutTuple(json)
      )
    )
  }

  private def parseResponse(response: Future[Response]): Future[Option[FaciaPage]] = {
    response.map { r =>
      r.status match {
        case 200 => parsePressedJson(r.body)
        case _   => None
      }
    }
  }

}

object FrontJson extends FrontJson