package frontpress

import common.Logging
import common.editions.Uk
import model._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import play.api.libs.json._
import services.{ParseCollection, S3FrontsApi, ConfigAgent, LiveCollections}

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

trait FrontPress extends Logging {
  private lazy implicit val frontPressContext = Akka.system.dispatchers.lookup("play.akka.actor.front-press")

  def pressDraftByPathId(id: String): Future[JsObject] =
    generateJson(id, DraftCollections).map { json =>
      (json \ "id").asOpt[String].foreach(S3FrontsApi.putDraftPressedJson(_, Json.stringify(json)))
      json
    }

  def pressLiveByPathId(id: String): Future[JsObject] =
    generateJson(id, LiveCollections).map { json =>
      (json \ "id").asOpt[String].foreach(S3FrontsApi.putLivePressedJson(_, Json.stringify(json)))
      json
    }

  def generateJson(id: String,
                   seoData: SeoData,
                   collections: Iterable[(Config, Collection)]): Try[JsObject] = {
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

  private def retrieveFrontByPath(id: String, parseCollection: ParseCollection): Future[Map[Config, Collection]] = {
    val collectionIds: List[Config] = ConfigAgent.getConfigForId(id).getOrElse(Nil)
    val collections = collectionIds.map(config => parseCollection.getCollection(config.id, config, Uk).map((config, _)))
    Future.sequence(collections).map(_.toMap)
  }

  private def generateJson(id: String, parseCollection: ParseCollection): Future[JsObject] = {
    for {
      seoData <- SeoData.getSeoData(id)
      front <- retrieveFrontByPath(id, parseCollection)
    } yield generateJson(id, seoData, front).get
  }
}

object FrontPress extends FrontPress
