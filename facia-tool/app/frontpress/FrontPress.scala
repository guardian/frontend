package frontpress

import model._
import common.editions.Uk
import scala.concurrent.Future
import common.Logging
import play.api.libs.json._
import common.FaciaToolMetrics.{FrontPressSuccess, FrontPressFailure}
import play.api.libs.concurrent.Akka
import play.api.libs.json.JsObject
import com.gu.openplatform.contentapi.model.Asset

trait FrontPress extends Logging {

  //The ONLY reason I am using case classes with a Writes instance is to
  //never have {"field": null} in the json, which inflates it
  //E.g. Get out of this: Json.obj(("field", None))
  case class CollectionJson
  (
    apiQuery:     Option[String],
    displayName:  Option[String],
    tone:         Option[String],
    curated:      Seq[JsValue],
    editorsPicks: Seq[JsValue],
    results:      Seq[JsValue],
    lastModified: Option[String],
    updatedBy:    Option[String],
    updatedEmail: Option[String],
    groups:       Option[Seq[String]],
    roleName:     Option[String],
    href:         Option[String]
  )
  case class ItemMeta
  (
    headline:     Option[JsValue],
    trailText:    Option[JsValue],
    group:        Option[JsValue],
    imageAdjust:  Option[JsValue],
    isBreaking:   Option[Boolean],
    supporting:   Option[Seq[JsValue]]
  )

  implicit val collectionJsonWrites = Json.writes[CollectionJson]
  implicit val itemMetaJsonWrites = Json.writes[ItemMeta]


  import play.api.Play.current
  private lazy implicit val frontPressContext = Akka.system.dispatchers.lookup("play.akka.actor.front-press")

  def generateJson(id: String): Future[JsObject] = {
    retrieveFrontByPath(id)
      .map(_.map{case (config, collection) =>
        Json.obj(
          config.id -> generateCollectionJson(config, collection)
        )})
      .map(_.foldLeft(Json.arr()){case (l, jsObject) => l :+ jsObject})
      .map( c =>
        Json.obj(
          ("id", id),
          ("collections", c)
        )
      )
  }

  private def retrieveFrontByPath(id: String): Future[Iterable[(Config, Collection)]] = {
    val collectionIds: List[Config] = FaciaToolConfigAgent.getConfigForId(id).getOrElse(Nil)
    val collections = collectionIds.map(config => FaciaToolCollectionParser.getCollection(config.id, config, Uk, isWarmedUp=true).map((config, _)))
    val futureSequence = Future.sequence(collections)
    futureSequence.onFailure{case t: Throwable =>
      FrontPressFailure.increment()
      log.warn(t.toString)
    }
    futureSequence.onSuccess{case _ =>
      FrontPressSuccess.increment()
      log.info(s"Successful press of $id")
    }
    futureSequence
  }

  private def generateCollectionJson(config: Config, collection: Collection): JsValue = {
    Json.obj(
      ("apiQuery", config.contentApiQuery),
      ("displayName", config.displayName),
      ("tone", config.collectionTone),
      ("curated", collection.curated.map(generateTrailJson)),
      ("editorsPicks", collection.editorsPicks.map(generateTrailJson)),
      ("results", collection.results.map(generateTrailJson)),
      ("lastModified", collection.lastUpdated),
      ("updatedBy", collection.updatedBy),
      ("updatedEmail", collection.updatedEmail),
      ("groups", config.groups),
      ("roleName", config.roleName),
      ("href", config.href)
    )
  }

  private def generateTrailJson(content: Content): JsValue =
    Json.obj(
      ("webTitle", content.webTitle),
      ("webPublicationDate", content.webPublicationDate),
      ("sectionName", content.sectionName),
      ("sectionId", content.section),
      ("id", content.url),
      ("webUrl", content.webUrl),
      ("safeFields", content.delegate.safeFields),
      ("elements", content.elements.map(generateElement)),
      ("linkText", content.linkText),
      ("meta", Json.obj
        (
          ("headline", content.headline),
          ("trailText", content.trailText),
          ("group", content.group),
          ("imageAdjust", content.imageAdjust),
          ("isBreaking", content.isBreaking),
          ("supporting", content.supporting.map(generateInnerTrailJson))
        )
        )
    )

  private def generateInnerTrailJson(trail: Trail): JsValue =
    Json.obj(
      ("webTitle", trail.headline),
      ("webPublicationDate", trail.webPublicationDate),
      ("sectionName", trail.sectionName),
      ("sectionId", trail.section),
      ("id", trail.url),
      ("webUrl", trail.webUrl),
      ("trailText", trail.trailText),
      ("linkText", trail.linkText),
      ("meta", Json.obj
        (
          ("headline", trail.headline),
          ("trailText", trail.trailText),
          ("group", trail.group),
          ("imageAdjust", trail.imageAdjust),
          ("isBreaking", trail.isBreaking)
        )
      )
    )

  private def generateElement(element: Element): JsValue =
    Json.obj(
    "id" -> element.id,
    "relation" -> element.delegate.relation,
    "type" -> element.delegate.`type`,
    "assets" -> element.delegate.assets.map(generateAsset)
  )

  private def generateAsset(asset: Asset): JsValue =
    Json.obj(
      "type" -> asset.`type`,
      "mimeType" -> asset.mimeType,
      "file" -> asset.file,
      "typeData" -> Json.obj(
        ("source", asset.typeData.get("source")),
        //("altText", a.typeData.get("altText")),
        ("height", asset.typeData.get("height")),
        //("credit", a.typeData.get("credit")),
        //("caption", a.typeData.get("caption")),
        ("width", asset.typeData.get("width"))
      )
    )

}

object FrontPress extends FrontPress
