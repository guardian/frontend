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
import conf.Switches
import services.{S3FrontsApi, DraftCollections, LiveCollections, ConfigAgent}
import scala.util.{Success, Failure}

case class PressCommand(ids: Set[String], live: Boolean = false, draft: Boolean = false) {
  def withPressLive(b: Boolean = true): PressCommand = this.copy(live=b)
  def withPressDraft(b: Boolean = true): PressCommand = this.copy(draft=b)
}

object PressCommand {
  def forOneId(id: String): PressCommand = PressCommand(Set(id))
}

case class PressResult(liveJson: Map[String, JsObject], draftJson: Map[String, JsObject])

trait FrontPress extends Logging {

  //The ONLY reason I am using case classes with a Writes instance is to
  //never have {"field": null} in the json, which inflates it
  //E.g. Get out of this: Json.obj(("field", None))
  case class CollectionJson
  (
    apiQuery:     Option[String],
    displayName:  Option[String],
    `type`:       Option[String],
    curated:      Seq[JsValue],
    editorsPicks: Seq[JsValue],
    mostViewed:   Seq[JsValue],
    results:      Seq[JsValue],
    lastUpdated:  Option[String],
    updatedBy:    Option[String],
    updatedEmail: Option[String],
    groups:       Option[Seq[String]],
    href:         Option[String],
    showTags:     Boolean,
    showSections: Boolean
  )
  case class ItemMeta
  (
    headline:     Option[JsValue],
    trailText:    Option[JsValue],
    group:        Option[JsValue],
    imageAdjust:  Option[JsValue],
    isBreaking:   Option[Boolean],
    supporting:   Option[Seq[JsValue]],
    href:         Option[JsValue],
    snapType:     Option[JsValue],
    snapCss:      Option[JsValue],
    snapUri:      Option[JsValue]
  )

  implicit val collectionJsonWrites = Json.writes[CollectionJson]
  implicit val itemMetaJsonWrites = Json.writes[ItemMeta]
  implicit val seoDataJsonWrites = Json.writes[SeoData]

  import play.api.Play.current
  private lazy implicit val frontPressContext = Akka.system.dispatchers.lookup("play.akka.actor.front-press")

  def pressDraftByPathId(path: String): Future[JsObject] =
    FrontPress.generateDraftJson(path).map { json =>
      (json \ "id").asOpt[String].foreach(S3FrontsApi.putDraftPressedJson(_, Json.stringify(json)))
      json
    }

  def pressLiveByPathId(path: String): Future[JsObject] =
    FrontPress.generateLiveJson(path).map { json =>
      (json \ "id").asOpt[String].foreach(S3FrontsApi.putLivePressedJson(_, Json.stringify(json)))
      json
    }

  def press(pressCommand: PressCommand): Future[PressResult] = {
    ConfigAgent.refreshAndReturn() flatMap { _ =>
      val paths: Set[String] = for {
        id <- pressCommand.ids
        path <- ConfigAgent.getConfigsUsingCollectionId(id)
      } yield path

      lazy val livePress: Future[Map[String, JsObject]]  =
        if (pressCommand.live)
          Future.traverse(paths){ path => pressLiveByPathId(path).map{ json => path -> json} }.map(_.toMap)
        else
          Future.successful(Map.empty)

      lazy val draftPress: Future[Map[String, JsObject]]  =
        if (pressCommand.draft)
          Future.traverse(paths){ path => pressDraftByPathId(path).map{ json => path -> json} }.map(_.toMap)
        else
          Future.successful(Map.empty)


      val ftr: Future[PressResult] = for {
        live <- livePress
        draft <-  draftPress
      } yield PressResult(live, draft)

      ftr onComplete {
        case Failure(error) =>
          FrontPressFailure.increment()
          log.error("Error manually pressing collection through update from tool", error)

        case Success(_) =>
          FrontPressSuccess.increment()
      }

      ftr
    }
  }


  def generateLiveJson(id: String): Future[JsObject] = {
    val futureSeoData: Future[SeoData] = SeoData.getSeoData(id)
    futureSeoData.flatMap { seoData =>
        retrieveFrontByPath(id).map(_.map {
          case (config, collection) =>
            Json.obj(
              config.id -> generateCollectionJson(config, collection)
            )
        })
          .map(_.foldLeft(Json.arr()) {
          case (l, jsObject) => l :+ jsObject
        })
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
      retrieveDraftFrontByPath(id).map(_.map {
        case (config, collection) =>
          Json.obj(
            config.id -> generateCollectionJson(config, collection)
          )
      })
        .map(_.foldLeft(Json.arr()) {
        case (l, jsObject) => l :+ jsObject
      })
        .map(c =>
        Json.obj("id" -> id) ++
          Json.obj("seoData" -> seoData) ++
          Json.obj("collections" -> c)
        )
    }
  }

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

  private def generateCollectionJson(config: Config, collection: Collection): JsValue =
    Json.toJson(
      CollectionJson(
        apiQuery       = config.contentApiQuery,
        displayName    = config.displayName.orElse(collection.displayName),
        curated        = collection.curated.map(generateTrailJson),
        editorsPicks   = collection.editorsPicks.map(generateTrailJson),
        mostViewed     = collection.mostViewed.map(generateTrailJson),
        results        = collection.results.map(generateTrailJson),
        lastUpdated    = collection.lastUpdated,
        updatedBy      = collection.updatedBy,
        updatedEmail   = collection.updatedEmail,
        groups         = Option(config.groups).filter(_.nonEmpty),
        href           = collection.href.orElse(config.href),
        `type`         = config.collectionType,
        showTags       = Switches.FaciaToolContainerTagsSwitch.isSwitchedOn && config.showTags,
        showSections   = Switches.FaciaToolContainerTagsSwitch.isSwitchedOn && config.showSections
      )
    )

  private def generateTrailJson(content: Content): JsValue =
    Json.obj(
      ("webPublicationDate", content.webPublicationDate),
      ("sectionName", content.sectionName),
      ("sectionId", content.section),
      ("id", content.id),
      ("webUrl", content.webUrl),
      ("tags", generateTags(content.tags)),
      ("safeFields", content.delegate.safeFields),
      ("elements", content.elements.map(generateElement)),
      ("meta", generateItemMeta(content))
    )

  private def generateTags(tags: Seq[Tag]): Seq[JsValue] =
    tags.map{ tag =>
      Json.obj(
        ("id", tag.id),
        ("type", tag.tagType),
        ("webTitle", tag.webTitle),
        ("webUrl", tag.webUrl),
        ("section", tag.section),
        ("bylineImageUrl", tag.contributorImagePath)
      )
    }

  private def generateInnerTrailJson(content: Content): JsValue =
    Json.obj(
      ("webPublicationDate", content.webPublicationDate),
      ("sectionName", content.sectionName),
      ("sectionId", content.section),
      ("id", content.id),
      ("webUrl", content.webUrl),
      ("tags", generateTags(content.tags)),
      ("trailText", content.trailText),
      ("safeFields", content.delegate.safeFields),
      ("meta", generateItemMeta(content))
    )

  private def generateElement(element: Element): JsValue =
    Json.obj(
    "id" -> element.id,
    "relation" -> element.delegate.relation,
    "type" -> element.delegate.`type`,
    "assets" -> element.delegate.assets.map(generateAsset)
  )

  //Asset typeData: width, height, credit, caption
  private def generateAsset(asset: Asset): JsValue =
    Json.obj(
      "type" -> asset.`type`,
      "mimeType" -> asset.mimeType,
      "file" -> asset.file,
      "typeData" -> asset.typeData
    )

  private def generateItemMeta(content: Content): JsValue =
    Json.toJson(
      ItemMeta(
        headline =    content.apiContent.metaData.get("headline"),
        trailText =   content.apiContent.metaData.get("trailText"),
        group =       content.apiContent.metaData.get("group"),
        imageAdjust = content.apiContent.metaData.get("imageAdjust"),
        isBreaking =  content.apiContent.metaData.get("isBreaking").flatMap(_.asOpt[Boolean]),
        supporting =  Option(content.supporting.map(generateInnerTrailJson)).filter(_.nonEmpty),
        href =        content.apiContent.metaData.get("href"),
        snapType = content.apiContent.metaData.get("snapType"),
        snapCss = content.apiContent.metaData.get("snapCss"),
        snapUri = content.apiContent.metaData.get("snapUri")
      )
    )

}

object FrontPress extends FrontPress
