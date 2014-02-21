package controllers.front

import model._
import scala.concurrent.Future
import play.api.libs.ws.{Response, WS}
import play.api.libs.json.{JsValue, Json}
import common.ExecutionContexts
import model.FaciaPage
import services.SecureS3Request
import conf.Configuration

trait FrontJson extends ExecutionContexts {

  val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String = s"$stage/frontsapi/pressed"

  private def getAddressForPath(path: String): String = s"$bucketLocation/$path/pressed.json"

  def get(path: String): Future[Option[FaciaPage]] = {
    val response = SecureS3Request.urlGet(getAddressForPath(path)).get()
    parseResponse(response)
  }

  private def parseCollection(json: JsValue): Collection = {
    val displayName: Option[String] = (json \ "displayName").asOpt[String]
    val href: Option[String] = (json \ "href").asOpt[String]
    val curated =      (json \ "curated").asOpt[List[JsValue]].getOrElse(Nil)
      .flatMap(Content.fromPressedJson)
    val editorsPicks = (json \ "editorsPicks").asOpt[List[JsValue]].getOrElse(Nil)
      .flatMap(Content.fromPressedJson)
    val mostViewed = (json \ "mostViewed").asOpt[List[JsValue]].getOrElse(Nil)
      .flatMap(Content.fromPressedJson)
    val results = (json \ "results").asOpt[List[JsValue]].getOrElse(Nil)
      .flatMap(Content.fromPressedJson)

    val lastUpdated = (json \ "lastUpdated").asOpt[String]
    val updatedBy = (json \ "updatedBy").asOpt[String]
    val updatedEmail = (json \ "updatedEmail").asOpt[String]

    Collection(
      curated=curated,
      editorsPicks=editorsPicks,
      mostViewed=mostViewed,
      results=results,
      displayName=displayName,
      href=href,
      lastUpdated=lastUpdated,
      updatedBy=updatedBy,
      updatedEmail=updatedEmail
    )
  }

  private def parseOutTuple(json: JsValue): List[(Config, Collection)] = {
    (json \ "collections").as[List[Map[String, JsValue]]].flatMap { m =>
      m.map { case (id, j) =>
        (parseConfig(id, j), parseCollection(j))
      }
    }
  }

  def parseConfig(id: String, json: JsValue): Config = {
    Config(
      id = id,
      contentApiQuery = (json \ "apiQuery").asOpt[String],
      displayName     = (json \ "displayName").asOpt[String],
      href            = (json \ "href").asOpt[String],
      groups          = (json \ "groups").asOpt[List[String]].getOrElse(Nil),
      collectionType  = (json \ "type").asOpt[String]
    )
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
