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

import scala.util.{Failure, Success, Try}

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

  def generateJson(id: String, futureFront: Future[Iterable[(Config, Collection)]]): Future[JsObject] = {
    for {
      seoData <- SeoData.getSeoData(id)
      front <- futureFront
    } yield generateJson(id, seoData, front).get
  }

  def generateJson(id: String, seoData: SeoData, collections: Iterable[(Config, Collection)]): Try[JsObject] = {
    val collectionsWithBackFills = collections.toList collect {
      case (config, collection) if config.contentApiQuery.isDefined => collection
    }

    if (collectionsWithBackFills.nonEmpty && collectionsWithBackFills.forall(_.isBackFillEmpty)) {
      val errorMessage = s"Tried to generate pressed JSON for front $id but all back fills were empty - aborting!"
      log.error(errorMessage)
      Failure(new RuntimeException(errorMessage))
    } else {
      val collectionsJson = collections.map { case (config, collection) =>
        Json.obj(config.id -> Json.toJson(CollectionJson.fromCollection(config, collection)))
      }.foldLeft(Json.arr()) { case (l, jsObject) => l :+ jsObject}

      Success(Json.obj("id" -> id, "seoData" -> seoData, "collections" -> collectionsJson))
    }
  }

  def generateLiveJson(id: String): Future[JsObject] = generateJson(id, retrieveFrontByPath(id))

  def generateDraftJson(id: String): Future[JsObject] = generateJson(id, retrieveDraftFrontByPath(id))
}

object FrontPress extends FrontPress
