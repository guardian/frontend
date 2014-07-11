package frontpress

import common.Logging
import common.editions.Uk
import conf.Switches._
import model._
import play.api.libs.concurrent.Akka
import play.api.libs.json._
import services._
import scala.concurrent.Future
import play.api.Play.current

trait FrontPress extends Logging {
  private lazy implicit val frontPressContext = Akka.system.dispatchers.lookup("play.akka.actor.front-press")

  private def retrieveFrontByPath(id: String): Future[Iterable[(Config, Collection)]] = {
    val collectionIds: List[Config] = ConfigAgent.getConfigForId(id).getOrElse(Nil)
    val collections = collectionIds.map(config => LiveCollections.getCollection(config.id, config, Uk).map((config, _)))
    Future.sequence(collections)
  }

  private def retrieveDraftFrontByPath(id: String): Future[Iterable[(Config, Collection)]] = {
    val collectionIds: List[Config] = ConfigAgent.getConfigForId(id).getOrElse(Nil)
    val collections = collectionIds.map(config => DraftCollections.getCollection(config.id, config, Uk).map((config, _)))
    Future.sequence(collections)
  }

  def pressDraftByPathId(path: String): Future[JsObject] =
    generateDraftJson(path).map { json =>
      (json \ "id").asOpt[String].foreach(S3FrontsApi.putDraftPressedJson(_, Json.stringify(json)))
      json
    }

  def pressLiveByPathId(path: String): Future[JsObject] =
    generateLiveJson(path).map { json =>
      (json \ "id").asOpt[String].foreach(S3FrontsApi.putLivePressedJson(_, Json.stringify(json)))
      json
    }

  def generateLiveJson(id: String): Future[JsObject] = {
    val futureSeoData: Future[SeoData] = SeoData.getSeoData(id)
    futureSeoData.flatMap { seoData =>
      retrieveFrontByPath(id)
        .map(_.map { case (config, collection) =>
        Json.obj(
          config.id -> Json.toJson(CollectionJson.fromCollection(config, collection))
        )})
        .map(_.foldLeft(Json.arr()) { case (l, jsObject) => l :+ jsObject})
        .map(c =>
        Json.obj("id" -> id) ++
          Json.obj("seoData" -> seoData) ++
          Json.obj("collections" -> c)
        )
    }
  }

  def generateDraftJson(id: String): Future[JsObject] = {
    val futureSeoData: Future[SeoData] = SeoData.getSeoData(id)
    futureSeoData.flatMap { seoData =>
      retrieveDraftFrontByPath(id)
        .map(_.map { case (config, collection) =>
        Json.obj(
          config.id -> Json.toJson(CollectionJson.fromCollection(config, collection))
        )})
        .map(_.foldLeft(Json.arr()) { case (l, jsObject) => l :+ jsObject})
        .map(c =>
        Json.obj("id" -> id) ++
          Json.obj("seoData" -> seoData) ++
          Json.obj("collections" -> c)
        )
    }
  }
}

object FrontPress extends FrontPress
