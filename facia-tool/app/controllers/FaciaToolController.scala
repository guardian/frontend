package controllers

import frontsapi.model._
import frontsapi.model.UpdateList
import play.api.mvc._
import play.api.libs.json._
import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import conf.Configuration
import tools.FaciaApi
import model.{NoCache, Cached}
import services._
import auth.ExpiringActions


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
      FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(Json.obj("id" -> id), "publish", identity.email))
    }
    ContentApiPush.notifyContentApi(Set(id))
    NoCache(Ok)
  }

  def discardCollection(id: String) = ExpiringActions.ExpiringAuthAction { request =>
    val identity = request.user
    val block = FaciaApi.discardBlock(id, identity)
    block.foreach { b =>
      FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(Json.obj("id" -> id), "discard", identity.email))
      UpdateActions.archiveDiscardBlock(id, b, identity)
      FaciaPress.press(PressCommand.forOneId(id).withPressDraft())
    }
    NoCache(Ok)
  }

  def collectionEdits(): Action[AnyContent] = ExpiringActions.ExpiringAuthAction { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      request.body.asJson flatMap (_.asOpt[Map[String, UpdateList]]) map {
        case update: Map[String, UpdateList] =>
          val identity = request.user

          update.foreach{ case (action, u) =>
            FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(Json.toJson(u), action, identity.email))}

          val updatedCollections: Map[String, Block] = update.collect {
            case ("update", updateList) =>
              UpdateActions.updateCollectionList(updateList.id, updateList, identity).map(updateList.id -> _)
            case ("remove", updateList) =>
              UpdateActions.updateCollectionFilter(updateList.id, updateList, identity).map(updateList.id -> _)
          }.flatten.toMap

          val shouldUpdateLive: Boolean = update.exists(_._2.live)

          val collectionIds = updatedCollections.keySet

          FaciaPress.press(PressCommand(
            collectionIds,
            live = shouldUpdateLive,
            draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || update.exists(_._2.draft)
          ))
          ContentApiPush.notifyContentApi(collectionIds)

          if (updatedCollections.nonEmpty)
            Ok(Json.toJson(updatedCollections)).as("application/json")
          else
            NotFound
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
