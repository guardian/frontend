package controllers.front

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import model._
import scala.concurrent.Future
import play.api.libs.json.{JsObject, JsNull, JsValue, JsString, Json}
import common.{Logging, S3Metrics, ExecutionContexts}
import model.FaciaPage
import services.{CollectionConfigWithId, SecureS3Request}
import conf.Configuration


trait FrontJsonLite extends ExecutionContexts{
  def get(json: JsValue): JsObject = {
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
      (j \ "id").asOpt[String].exists(Snap.isSnap)
     }
    .map{ j =>
      Json.obj(
        "headline" -> ((j \ "meta" \ "headline").asOpt[JsString].getOrElse(j \ "safeFields" \ "headline"): JsValue),
        "trailText" -> ((j \ "meta" \ "trailText").asOpt[JsString].getOrElse(j \ "safeFields" \ "trailText"): JsValue),
        "thumbnail" -> (j \ "safeFields" \ "thumbnail"),
        "shortUrl" -> (j \ "safeFields" \ "shortUrl"),
        "id" -> (j \ "id")
      )
    }
  }
}

object FrontJsonLite extends FrontJsonLite


trait FrontJson extends ExecutionContexts with Logging {

  val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String

  private def getAddressForPath(path: String): String = s"$bucketLocation/${path.replaceAll("""\+""","%2B")}/pressed.json"

  def get(path: String): Future[Option[FaciaPage]] = {
    val response = SecureS3Request.urlGet(getAddressForPath(path)).get()
    response.map { r =>
      r.status match {
        case 200 => parsePressedJson(r.body)
        case 403 =>
          S3Metrics.S3AuthorizationError.increment()
          log.warn(s"Got 403 trying to load path: $path")
          None
        case 404 =>
          log.warn(s"Got 404 trying to load path: $path")
          None
        case responseCode =>
          log.warn(s"Got $responseCode trying to load path: $path")
          None
      }
    }
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
    val treats = (json \ "treats").asOpt[List[JsValue]].getOrElse(Nil)
      .flatMap(Content.fromPressedJson)

    val lastUpdated = (json \ "lastUpdated").asOpt[String]
    val updatedBy = (json \ "updatedBy").asOpt[String]
    val updatedEmail = (json \ "updatedEmail").asOpt[String]

    Collection(
      curated=curated,
      editorsPicks=editorsPicks,
      mostViewed=mostViewed,
      results=results,
      treats=treats,
      displayName=displayName,
      href=href,
      lastUpdated=lastUpdated,
      updatedBy=updatedBy,
      updatedEmail=updatedEmail
    )
  }

  private def parseOutTuple(json: JsValue): List[(CollectionConfigWithId, Collection)] = {
    (json \ "collections").as[List[Map[String, JsValue]]].flatMap { m =>
      m.map { case (id, j) =>
        (CollectionConfigWithId(id, parseConfig(id, j)), parseCollection(j))
      }
    }
  }

  def parseConfig(id: String, json: JsValue): CollectionConfig =
    CollectionConfig(
      apiQuery        = (json \ "apiQuery").asOpt[String],
      displayName     = (json \ "displayName").asOpt[String],
      href            = (json \ "href").asOpt[String],
      groups          = (json \ "groups").asOpt[List[String]],
      `type`          = (json \ "type").asOpt[String],
      showTags        = (json \ "showTags").asOpt[Boolean],
      showSections    = (json \ "showSections").asOpt[Boolean],
      uneditable      = (json \ "uneditable").asOpt[Boolean],
      hideKickers     = (json \ "hideKickers").asOpt[Boolean],
      showDateHeader =  (json \ "showDateHeader").asOpt[Boolean],
      showLatestUpdate = (json \ "showLatestUpdate").asOpt[Boolean],
      excludeFromRss = (json \ "excludeFromRss").asOpt[Boolean],
      showTimestamps = (json \ "showTimestamps").asOpt[Boolean]
    )

  private def parsePressedJson(j: String): Option[FaciaPage] = {
    val json = Json.parse(j)
    val id: String = (json \ "id").as[String]
    Option(
      FaciaPage(
        id,
        seoData     = parseSeoData(id, (json \ "seoData").asOpt[JsValue].getOrElse(JsNull)),
        frontProperties = parseFrontProperties((json \ "frontProperties").asOpt[JsValue].getOrElse(JsNull)),
        collections = parseOutTuple(json)
      )
    )
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

  def parseFrontProperties(json: JsValue) = FrontProperties(
    onPageDescription = (json \ "onPageDescription").asOpt[String].filter(_.nonEmpty),
    imageUrl = (json \ "imageUrl").asOpt[String].filter(_.nonEmpty),
    imageWidth = (json \ "imageWidth").asOpt[String].filter(_.nonEmpty),
    imageHeight = (json \ "imageHeight").asOpt[String].filter(_.nonEmpty),
    isImageDisplayed = (json \ "isImageDisplayed").asOpt[Boolean].getOrElse(false),
    editorialType = (json \ "editorialType").asOpt[String].filter(_.nonEmpty)
  )

}

object FrontJsonLive extends FrontJson {
  val bucketLocation: String = s"$stage/frontsapi/pressed/live"
}
