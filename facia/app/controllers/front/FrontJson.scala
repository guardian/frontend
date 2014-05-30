package controllers.front

import model._
import scala.concurrent.Future
import play.api.libs.ws.{Response, WS}
import play.api.libs.json.{JsObject, JsNull, JsValue, Json}
import common.ExecutionContexts
import model.FaciaPage
import services.SecureS3Request
import conf.Configuration


trait FrontJsonLite extends ExecutionContexts{
  def get(json: JsValue): JsValue = {
    Json.obj(
      "webTitle" -> (json \ "seoData" \ "webTitle"),
      "collections" -> getCollections(json)
    )
  }

  private def getCollections(json: JsValue): Seq[JsValue] = {
    (json \ "collections").asOpt[Seq[Map[String, JsObject]]].getOrElse(Nil).flatMap{ c => c.values.map(getCollection) }
  }

  private def getCollection(json: JsValue): JsValue = {
    Json.obj(
        "displayName" -> (json \ "displayName"),
        "href" -> (json \ "href"),
        "content" -> getContent(json)
    )
  }

  private def getContent(json: JsValue): Seq[JsValue] = {
    val curated = (json \ "curated").asOpt[Seq[JsObject]].getOrElse(Nil)
    val editorsPicks = (json \ "editorsPicks").asOpt[Seq[JsObject]].getOrElse(Nil)
    val results = (json \ "results").asOpt[Seq[JsObject]].getOrElse(Nil)

    (curated ++ editorsPicks ++ results)
    .filterNot{ j =>
      (j \ "id").asOpt[String].exists(_.startsWith("snap/"))
     }
    .take(3).map{ j =>
      Json.obj(
        "headline" -> (j \ "safeFields" \ "headline"),
        "thumbnail" -> (j \ "safeFields" \ "thumbnail"),
        "id" -> (j \ "id")
      )
    }
  }
}

object FrontJsonLite extends FrontJsonLite


trait FrontJson extends ExecutionContexts {

  val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String = s"$stage/frontsapi/pressed"

  private def getAddressForPath(path: String): String = s"$bucketLocation/$path/pressed.json"

  def get(path: String): Future[Option[FaciaPage]] = {
    val response = SecureS3Request.urlGet(getAddressForPath(path)).get()
    parseResponse(response)
  }

  def getAsJsValue(path: String): Future[JsValue] = {
    val response = SecureS3Request.urlGet(getAddressForPath(path)).get()

    response.map { r =>
      r.status match {
        case 200 => Json.parse(r.body)
        case _   => JsObject(Nil)
      }
    }
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
      collectionType  = (json \ "type").asOpt[String],
      showTags = (json \ "showTags").asOpt[Boolean] getOrElse false,
      showSections = (json \ "showSections").asOpt[Boolean] getOrElse false
    )
  }

  private def parsePressedJson(j: String): Option[FaciaPage] = {
    val json = Json.parse(j)
    val id: String = (json \ "id").as[String]
    Option(
      FaciaPage(
        id,
        seoData     = parseSeoData(id, (json \ "seoData").asOpt[JsValue].getOrElse(JsNull)),
        collections = parseOutTuple(json)
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

  private def parseSeoData(id: String, seoJson: JsValue): SeoData = {
    val seoDataJson = SeoDataJson(
      id,
      (seoJson \ "navSection").asOpt[String].filter(_.nonEmpty),
      (seoJson \ "webTitle").asOpt[String].filter(_.nonEmpty),
      (seoJson \ "title").asOpt[String].filter(_.nonEmpty),
      (seoJson \ "description").asOpt[String].filter(_.nonEmpty)
    )

    val seoDataFromPath: SeoData = SeoData.fromPath(id)

    SeoData(
      id,
      seoDataJson.navSection.getOrElse(seoDataFromPath.navSection),
      seoDataJson.webTitle.getOrElse(seoDataFromPath.webTitle),
      seoDataJson.title,
      seoDataJson.description.orElse(seoDataFromPath.description)
      )
  }

}

object FrontJson extends FrontJson
