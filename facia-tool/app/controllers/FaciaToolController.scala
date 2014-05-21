package controllers

import util.SanitizeInput
import frontsapi.model._
import frontsapi.model.UpdateList
import jobs.FrontPressJob
import play.api.mvc.{AnyContent, Action, Controller}
import play.api.libs.json._
import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import conf.{Switches, Configuration}
import tools.FaciaApi
import services.{ContentApiRefresh, ConfigAgent, ContentApiWrite, S3FrontsApi}
import play.api.libs.ws.Response
import scala.concurrent.Future
import conf.Switches.ContentApiPutSwitch
import model.{NoCache, Cached}
import scala.util.{Failure, Success}
import play.api.libs.Comet

object FaciaToolController extends Controller with Logging with ExecutionContexts {
  implicit val collectionRead = Json.reads[Collection]
  implicit val frontRead = Json.reads[Front]
  implicit val configRead = Json.reads[Config]
  implicit val collectionWrite = Json.writes[Collection]
  implicit val frontWrite= Json.writes[Front]
  implicit val configWrite = Json.writes[Config]

  implicit val updateListRead = Json.reads[UpdateList]
  implicit val collectionMetaRead = Json.reads[CollectionMetaUpdate]
  implicit val trailWrite = Json.writes[Trail]
  implicit val blockWrite = Json.writes[Block]

  def collectionsEditor() = ExpiringAuthentication { request =>
    val identity = Identity(request).get
    Cached(60) { Ok(views.html.collections(Configuration.environment.stage, Option(identity))) }
  }

  def configEditor() = ExpiringAuthentication { request =>
    val identity = Identity(request).get
    Cached(60) { Ok(views.html.config(Configuration.environment.stage, Option(identity))) }
  }

  def listCollections = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache { Ok(Json.toJson(S3FrontsApi.listCollectionIds)) }
  }

  def getConfig = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      S3FrontsApi.getMasterConfig map { json =>
        Ok(json).as("application/json")
      } getOrElse NotFound
    }
  }

  def updateConfig(): Action[AnyContent] = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    val configJson: Option[JsValue] = request.body.asJson
    NoCache {
      configJson.flatMap(_.asOpt[Config]).map(SanitizeInput.fromConfigSeo).map {
        case update: Config => {

          //Only update if it is a valid Config object
          configJson.foreach { json =>
            ConfigAgent.refreshWith(json)
          }

          val identity = Identity(request).get
          UpdateActions.putMasterConfig(update, identity)
          Ok
        }
        case _ => NotFound
      } getOrElse NotFound
    }
  }

  def readBlock(id: String) = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      S3FrontsApi.getBlock(id) map { json =>
        Ok(json).as("application/json")
      } getOrElse NotFound
    }
  }

  def publishAll() = ExpiringAuthentication { request =>
    Ok(views.html.publish_all(Configuration.environment.stage, Identity(request)))
  }

  def publishAllStream() = ExpiringAuthentication { request =>
    Ok.chunked((ContentApiRefresh.refresh() map {
      case (collectionId, Success(_)) => s"Successfully published $collectionId"
      case (collectionId, Failure(error)) => s"Failed to publish $collectionId: ${error.getMessage}"
    }) through Comet(callback = "parent.cometMessage"))
  }

  def publishCollection(id: String) = AjaxExpiringAuthentication { request =>
    val identity = Identity(request).get
    FaciaToolMetrics.DraftPublishCount.increment()
    val block = FaciaApi.publishBlock(id, identity)
    block.foreach{ b =>
      UpdateActions.archivePublishBlock(id, b, identity)
      pressCollectionId(id)
    }
    notifyContentApi(id)
    NoCache(Ok)
  }

  def discardCollection(id: String) = AjaxExpiringAuthentication { request =>
    val identity = Identity(request).get
    val block = FaciaApi.discardBlock(id, identity)
    block.foreach { b =>
      UpdateActions.archiveDiscardBlock(id, b, identity)
    }
    NoCache(Ok)
  }

  def updateCollectionMeta(id: String): Action[AnyContent] = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      request.body.asJson flatMap(_.asOpt[CollectionMetaUpdate]) map {
        case update: CollectionMetaUpdate => {
          val identity = Identity(request).get
          UpdateActions.updateCollectionMeta(id, update, identity)
          notifyContentApi(id)
          Ok
        }
        case _ => NotFound
      } getOrElse NotFound
    }
  }

  def collectionEdits(): Action[AnyContent] = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      request.body.asJson flatMap (_.asOpt[Map[String, UpdateList]]) map {
        case update: Map[String, UpdateList] =>
          val identity: Identity = Identity(request).get
          val updatedCollections: Map[String, Block] = update.collect {
            case ("update", updateList) =>
              UpdateActions.updateCollectionList(updateList.id, updateList, identity).map(updateList.id -> _)
            case ("remove", updateList) =>
              UpdateActions.updateCollectionFilter(updateList.id, updateList, identity).map(updateList.id -> _)
          }.flatten.toMap

          pressCollectionIds(updatedCollections.keySet)
          updatedCollections.keys.foreach(notifyContentApi)

          if (updatedCollections.nonEmpty)
            Ok(Json.toJson(updatedCollections)).as("application/json")
          else
            NotFound
      } getOrElse NotFound
    }
  }

  def updateCollection(id: String) = AjaxExpiringAuthentication { request =>
    pressCollectionId(id)
    notifyContentApi(id)
    NoCache(Ok)
  }

  def notifyContentApi(id: String): Option[Future[Response]] =
    if (ContentApiPutSwitch.isSwitchedOn)
      ConfigAgent.getConfig(id)
        .map {config => ContentApiWrite.writeToContentapi(config)}
    else None

  def pressCollectionId(id: String): Unit = pressCollectionIds(Set(id))
  def pressCollectionIds(ids: Set[String]): Unit =
    if (Switches.FaciaToolPressSwitch.isSwitchedOn) {
      FrontPressJob.pressByCollectionIds(ids)
    }

  def getLastModified(path: String) = AjaxExpiringAuthentication { request =>
    val now: Option[String] = S3FrontsApi.getPressedLastModified(path)
    now.map(Ok(_)).getOrElse(NotFound)
  }
}
