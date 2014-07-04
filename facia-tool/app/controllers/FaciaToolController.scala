package controllers

import play.api.libs.ws.Response
import util.SanitizeInput
import frontsapi.model._
import frontsapi.model.UpdateList
import play.api.mvc.{AnyContent, Action, Controller}
import play.api.libs.json._
import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import conf.{Switches, Configuration}
import Switches.ContentApiPutSwitch
import tools.FaciaApi
import services.{ContentApiWrite, ContentApiRefresh, ConfigAgent, S3FrontsApi}
import model.{NoCache, Cached}
import scala.concurrent.Future
import scala.util.{Failure, Success}
import play.api.libs.Comet
import frontpress.PressCommand
import frontpress.FrontPress.{pressLiveByPathId, pressDraftByPathId}
import frontpress.CollectionPressing.pressCollectionIds

object FaciaToolController extends Controller with Logging with ExecutionContexts {
  def priorities() = ExpiringAuthentication { request =>
    val identity = Identity(request).get
    Cached(60) { Ok(views.html.priority(Configuration.environment.stage, "", Option(identity))) }
  }

  def collectionEditor(priority: String) = ExpiringAuthentication { request =>
    val identity = Identity(request).get
    Cached(60) { Ok(views.html.collections(Configuration.environment.stage, priority, Option(identity))) }
  }

  def configEditor(priority: String) = ExpiringAuthentication { request =>
    val identity = Identity(request).get
    Cached(60) { Ok(views.html.config(Configuration.environment.stage, priority, Option(identity))) }
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
      pressCollectionIds(PressCommand.forOneId(id).withPressLive())
    }
    notifyContentApi(id)
    NoCache(Ok)
  }

  def discardCollection(id: String) = AjaxExpiringAuthentication { request =>
    val identity = Identity(request).get
    val block = FaciaApi.discardBlock(id, identity)
    block.foreach { b =>
      UpdateActions.archiveDiscardBlock(id, b, identity)
      pressCollectionIds(PressCommand.forOneId(id).withPressDraft())
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

          val shouldUpdateLive: Boolean = update.exists(_._2.live)

          val pressCommand: PressCommand =
            PressCommand(
              updatedCollections.keySet,
              live = shouldUpdateLive,
              draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || update.exists(_._2.draft)
            )

          pressCollectionIds(pressCommand)

          updatedCollections.keys.foreach(notifyContentApi)

          if (updatedCollections.nonEmpty)
            Ok(Json.toJson(updatedCollections)).as("application/json")
          else
            NotFound
      } getOrElse NotFound
    }
  }

  def pressLivePath(path: String) = AjaxExpiringAuthentication { request =>
    pressLiveByPathId(path)
    NoCache(Ok)
  }

  def pressDraftPath(path: String) = AjaxExpiringAuthentication { request =>
    pressDraftByPathId(path)
    NoCache(Ok)
  }

  def notifyContentApi(id: String): Option[Future[Response]] =
    if (ContentApiPutSwitch.isSwitchedOn)
      ConfigAgent.getConfig(id)
        .map {config => ContentApiWrite.writeToContentapi(config)}
    else None

  def getLastModified(path: String) = AjaxExpiringAuthentication { request =>
    val now: Option[String] = S3FrontsApi.getPressedLastModified(path)
    now.map(Ok(_)).getOrElse(NotFound)
  }
}
