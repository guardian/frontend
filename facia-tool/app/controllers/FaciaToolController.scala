package controllers

import auth.ExpiringActions
import common.{ExecutionContexts, FaciaToolMetrics, Logging}
import conf.Configuration
import frontsapi.model._
import model.{Cached, NoCache}
import play.api.libs.json._
import play.api.mvc._
import services._
import tools.FaciaApi


object FaciaToolController extends Controller with Logging with ExecutionContexts {

  def priorities() = ExpiringActions.ExpiringAuthAction { request =>
    val identity = request.user
    Cached(60) { Ok(views.html.priority(Configuration.environment.stage, "", Option(identity))) }
  }

  def collectionEditor(priority: String) = ExpiringActions.ExpiringAuthAction { request =>
    val identity = request.user
    Cached(60) { Ok(views.html.collections(Configuration.environment.stage, priority, Option(identity))) }
  }

  def configEditor(priority: String) = ExpiringActions.ExpiringAuthAction { request =>
    val identity = request.user
    Cached(60) { Ok(views.html.config(Configuration.environment.stage, priority, Option(identity))) }
  }

  def listCollections = ExpiringActions.ExpiringAuthAction { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache { Ok(Json.toJson(S3FrontsApi.listCollectionIds)) }
  }

  def getConfig = ExpiringActions.ExpiringAuthAction { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      S3FrontsApi.getMasterConfig map { json =>
        Ok(json).as("application/json")
      } getOrElse NotFound
    }
  }

  def readBlock(id: String) = ExpiringActions.ExpiringAuthAction { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      S3FrontsApi.getBlock(id) map { json =>
        Ok(json).as("application/json")
      } getOrElse NotFound
    }
  }

  def publishCollection(id: String) = ExpiringActions.ExpiringAuthAction { request =>
    val identity = request.user
    FaciaToolMetrics.DraftPublishCount.increment()
    val block = FaciaApi.publishBlock(id, identity)
    block foreach { b =>
      UpdateActions.archivePublishBlock(id, b, identity)
      FaciaPress.press(PressCommand.forOneId(id).withPressDraft().withPressLive())
      FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(DiscardUpdate(id), "publish", identity.email))
    }
    ContentApiPush.notifyContentApi(Set(id))
    NoCache(Ok)
  }

  def discardCollection(id: String) = ExpiringActions.ExpiringAuthAction { request =>
    val identity = request.user
    val block = FaciaApi.discardBlock(id, identity)
    block.foreach { b =>
      FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(DiscardUpdate(id), "discard", identity.email))
      UpdateActions.archiveDiscardBlock(id, b, identity)
      FaciaPress.press(PressCommand.forOneId(id).withPressDraft())
    }
    NoCache(Ok)
  }

  def collectionEdits(): Action[AnyContent] = ExpiringActions.ExpiringAuthAction { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      request.body.asJson.flatMap (_.asOpt[FaciaToolUpdate]).map {
        case update: Update =>
          val identity = request.user

          FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(update, "update", identity.email))

          val updatedCollections = UpdateActions.updateCollectionList(update.update.id, update.update, identity)
            .map(update.update.id -> _).toMap

          val shouldUpdateLive: Boolean = update.update.live

          val collectionIds = updatedCollections.keySet

          FaciaPress.press(PressCommand(
            collectionIds,
            live = shouldUpdateLive,
            draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || update.update.draft)
          )
          ContentApiPush.notifyContentApi(collectionIds)

          if (updatedCollections.nonEmpty)
            Ok(Json.toJson(updatedCollections)).as("application/json")
          else
            NotFound
        case remove: Remove =>
          val identity = request.user
          val updatedCollections = UpdateActions.updateCollectionFilter(remove.remove.id, remove.remove, identity)
            .map(remove.remove.id -> _).toMap
          val shouldUpdateLive: Boolean = remove.remove.live
          val collectionIds = updatedCollections.keySet
          FaciaPress.press(PressCommand(
            collectionIds,
            live = shouldUpdateLive,
            draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || remove.remove.draft)
          )
          Ok(Json.toJson(updatedCollections)).as("application/json")
        case updateAndRemove: UpdateAndRemove =>
          val identity = request.user
          val updatedCollections =
            List(UpdateActions.updateCollectionList(updateAndRemove.update.id, updateAndRemove.update, identity).map(updateAndRemove.update.id -> _),
                 UpdateActions.updateCollectionFilter(updateAndRemove.remove.id, updateAndRemove.remove, identity).map(updateAndRemove.remove.id -> _)
            ).flatten.toMap

          val shouldUpdateLive: Boolean = updateAndRemove.remove.live || updateAndRemove.update.live
          val shouldUpdateDraft: Boolean = updateAndRemove.remove.draft || updateAndRemove.update.draft
          val collectionIds = updatedCollections.keySet
          FaciaPress.press(PressCommand(
            collectionIds,
            live = shouldUpdateLive,
            draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || shouldUpdateDraft)
          )
          Ok(Json.toJson(updatedCollections)).as("application/json")
        case _ => NotAcceptable
      } getOrElse NotFound
    }
  }

  def pressLivePath(path: String) = ExpiringActions.ExpiringAuthAction { request =>
    FaciaPressQueue.enqueue(PressJob(FrontPath(path), Live))
    NoCache(Ok)
  }

  def pressDraftPath(path: String) = ExpiringActions.ExpiringAuthAction { request =>
    FaciaPressQueue.enqueue(PressJob(FrontPath(path), Draft))
    NoCache(Ok)
  }

  def updateCollection(id: String) = ExpiringActions.ExpiringAuthAction { request =>
    FaciaPress.press(PressCommand.forOneId(id).withPressDraft().withPressLive())
    ContentApiPush.notifyContentApi(Set(id))
    NoCache(Ok)
  }

  def getLastModified(path: String) = ExpiringActions.ExpiringAuthAction { request =>
    val now: Option[String] = S3FrontsApi.getPressedLastModified(path)
    now.map(Ok(_)).getOrElse(NotFound)
  }
}
