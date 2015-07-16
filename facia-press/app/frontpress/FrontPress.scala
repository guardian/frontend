package frontpress

import com.gu.contentapi.client.model.ItemResponse
import common.FaciaPressMetrics.{ContentApiSeoRequestFailure, ContentApiSeoRequestSuccess}
import common.{Edition, Logging}
import common.editions.Uk
import conf.LiveContentApi
import model.SeoData._
import model._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import play.api.libs.json._
import services._
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

object BlockingExceptions {
  val exceptions: List[String] = List("breaking-news")
}

trait FrontPress extends Logging {
  private lazy implicit val frontPressContext = Akka.system.dispatchers.lookup("play.akka.actor.front-press")

  def pressDraftByPathId(id: String): Future[JsObject] = generateJson(id, DraftCollections).map { json =>
    (json \ "id").asOpt[String].foreach(S3FrontsApi.putDraftPressedJson(_, Json.stringify(json)))
    json
  }

  def pressLiveByPathId(id: String): Future[JsObject] = generateJson(id, LiveCollections).map { json =>
    (json \ "id").asOpt[String].foreach(S3FrontsApi.putLivePressedJson(_, Json.stringify(json)))
    json
  }

  def generateJson(id: String,
                   seoData: SeoData,
                   frontProperties: FrontProperties,
                   collections: Seq[(CollectionConfigWithId, Collection)]): Try[JsObject] = {

    if (!BlockingExceptions.exceptions.contains(id) && collections.forall(_._2.isEmpty)) {
      val errorMessage = s"Tried to generate pressed JSON for front $id but it ended up being empty - aborting!"
      log.error(errorMessage)
      Failure(new RuntimeException(errorMessage))
    } else {
      val collectionsJson = collections.map { case (configWithId, collection) =>
        Json.obj(configWithId.id -> Json.toJson(CollectionJson.fromCollection(configWithId.config, collection)))
      }.foldLeft(Json.arr()) { case (l, jsObject) => l :+ jsObject}

      Success(Json.obj(
        "id" -> id,
        "seoData" -> seoData,
        "frontProperties" -> frontProperties,
        "collections" -> collectionsJson))
    }
  }

  private def retrieveCollectionsById(id: String, parseCollection: ParseCollection): Future[Seq[(CollectionConfigWithId, Collection)]] = {
    val collectionIds: List[CollectionConfigWithId] =
      ConfigAgent.getConfigForId(id)
        .getOrElse{
        log.warn(s"There are no collections for path $id")
        throw new IllegalStateException(s"There are no collections for path $id")
      }
    val collections = collectionIds.map(config => parseCollection.getCollection(config.id, config.config, Uk).map((config, _)))
    Future.sequence(collections)
  }

  private def generateJson(id: String, parseCollection: ParseCollection): Future[JsObject] =
    for {
      (seoData, frontProperties) <- getFrontSeoAndProperties(id)
      collections <- retrieveCollectionsById(id, parseCollection)
    } yield generateJson(id, seoData, frontProperties, collections).get

  private def getFrontSeoAndProperties(path: String): Future[(SeoData, FrontProperties)] =
    for {
      itemResp <- getCapiItemResponseForPath(path)
    } yield {
      val seoFromConfig = ConfigAgent.getSeoDataJsonFromConfig(path)
      val seoFromPath = SeoData.fromPath(path)

      val navSection: String = seoFromConfig.navSection
        .orElse(itemResp.flatMap(getNavSectionFromItemResponse))
        .getOrElse(seoFromPath.navSection)
      val webTitle: String = seoFromConfig.webTitle
        .orElse(itemResp.flatMap(getWebTitleFromItemResponse))
        .getOrElse(seoFromPath.webTitle)
      val title: Option[String] = seoFromConfig.title
      val description: Option[String] = seoFromConfig.description
        .orElse(SeoData.descriptionFromWebTitle(webTitle))

      val frontProperties: FrontProperties = ConfigAgent.fetchFrontProperties(path)
        .copy(editorialType = itemResp.flatMap(_.tag).map(_.`type`))

      val seoData: SeoData = SeoData(path, navSection, webTitle, title, description)
      (seoData, frontProperties)
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
    val contentApiResponse:Future[ItemResponse] = LiveContentApi.getResponse(LiveContentApi
      .item(id, Edition.defaultEdition)
      .showEditorsPicks(false)
      .pageSize(0)
    )

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
