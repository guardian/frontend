package frontpress

import model.{ContentWithMetaData, Trail, Collection, Config}
import common.editions.Uk
import scala.concurrent.Future
import common.{Logging, ExecutionContexts}
import play.api.libs.json._
import common.FaciaToolMetrics.{FrontPressSuccess, FrontPressFailure}

trait FrontPress extends ExecutionContexts with Logging {

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
      ("updatedEmail", collection.updatedEmail)
      //TODO: lastModified, modifiedBy
    )
  }

  private def generateTrailJson(trail: Trail): JsValue =
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
            ("isBreaking", trail.isBreaking),
            ("supporting", trail.supporting.map(generateInnerTrailJson))
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
}

object FrontPress extends FrontPress
