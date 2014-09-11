package frontpress

import com.gu.openplatform.contentapi.model.ItemResponse
import common.FaciaPressMetrics.{ContentApiSeoRequestFailure, ContentApiSeoRequestSuccess}
import common.{Edition, Logging}
import common.editions.Uk
import conf.LiveContentApi
import model.SeoData._
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

      Success(Json.obj(
        "id" -> id,
        "seoData" -> seoData,
        "collections" -> collectionsJson))
    }
  }

  private def retrieveCollectionsById(id: String, parseCollection: ParseCollection): Future[Map[Config, Collection]] = {
    val collectionIds: List[Config] = ConfigAgent.getConfigForId(id).getOrElse(Nil)
    val collections = collectionIds.map(config => parseCollection.getCollection(config.id, config, Uk).map((config, _)))
    Future.sequence(collections).map(_.toMap)
  }

  private def generateJson(id: String, parseCollection: ParseCollection): Future[JsObject] =
    for {
      seoData <- CapiClient.getSeoData(id)
      collections <- retrieveCollectionsById(id, parseCollection)
    } yield generateJson(id, seoData, collections).get

}

object CapiClient {
  def getSeoData(path: String): Future[SeoData] = {
    for {
      itemResp <- getCapiItemResponseForPath(path)
    } yield {
      val sc = ConfigAgent.getSeoDataJsonFromConfig(path)
      val seoData = SeoData.fromPath(path)

      val navSection: String = sc.navSection
        .orElse(itemResp.flatMap(getNavSectionFromItemResponse))
        .getOrElse(seoData.navSection)
      val webTitle: String = sc.webTitle
        .orElse(itemResp.flatMap(getWebTitleFromItemResponse))
        .getOrElse(seoData.webTitle)
      val title: Option[String] = sc.title
      val description: Option[String] = sc.description
        .orElse(SeoData.descriptionFromWebTitle(webTitle))

      SeoData(path, navSection, webTitle, title, description)
    }
  }

  private def getNavSectionFromItemResponse(itemResponse: ItemResponse): Option[String] =
    itemResponse.tag.flatMap(_.sectionId)
      .orElse(itemResponse.section.map(_.id).map(removeLeadEditionFromSectionId))

  private def getWebTitleFromItemResponse(itemResponse: ItemResponse): Option[String] =
    itemResponse.tag.map(_.webTitle)
      .orElse(itemResponse.section.map(_.webTitle))

  //This will turn au/culture into culture. We want to stay consistent with the manual entry and autogeneration
  private def removeLeadEditionFromSectionId(sectionId: String): String = sectionId.split('/').toList match {
    case edition :: tail if Edition.all.map(_.id.toLowerCase).contains(edition.toLowerCase) => tail.mkString("/")
    case _ => sectionId
  }

  private def getCapiItemResponseForPath(id: String): Future[Option[ItemResponse]] = {
    val contentApiResponse:Future[ItemResponse] = LiveContentApi
      .item(id, Edition.defaultEdition)
      .showEditorsPicks(false)
      .pageSize(0)
      .response

    contentApiResponse.onSuccess { case _ =>
      ContentApiSeoRequestSuccess.increment()
      log.info(s"Getting SEO data from content API for $id")}
    contentApiResponse.onFailure { case e: Exception =>
      log.warn(s"Error getting SEO data from content API for $id: $e")
      ContentApiSeoRequestFailure.increment()
    }

    contentApiResponse.map(Option(_)).fallbackTo(Future.successful(None))
  }
}

object FrontPress extends FrontPress
