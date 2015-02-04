package controllers

import auth.ExpiringActions
import common.{ExecutionContexts, FaciaToolMetrics, Logging}
import conf.Configuration
import fronts.FrontsApi
import frontsapi.model._
import model.{Cached, NoCache}
import play.api.libs.json._
import play.api.mvc._
import services._
import tools.FaciaApiIO

import scala.concurrent.Future


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

  def getConfig = ExpiringActions.ExpiringAuthAction.async { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    FrontsApi.amazonClient.config.map { configJson =>
      NoCache {
        Ok(Json.toJson(configJson)).as("application/json")}}}

  def getCollection(collectionId: String) = ExpiringActions.ExpiringAuthAction.async { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    FrontsApi.amazonClient.collection(collectionId).map { configJson =>
      NoCache {
        Ok(Json.toJson(configJson)).as("application/json")}}}

  def publishCollection(collectionId: String) = ExpiringActions.ExpiringAuthAction.async { request =>
    val identity = request.user
    FaciaToolMetrics.DraftPublishCount.increment()
    val futureCollectionJson = FaciaApiIO.publishCollectionJson(collectionId, identity)
    futureCollectionJson.map { maybeCollectionJson =>
      maybeCollectionJson.foreach { b =>
        UpdateActions.archivePublishBlock(collectionId, b, identity)
        FaciaPress.press(PressCommand.forOneId(collectionId).withPressDraft().withPressLive())
        FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(PublishUpdate(collectionId), identity.email))}
    ContentApiPush.notifyContentApi(Set(collectionId))
    NoCache(Ok)}}

  def discardCollection(collectionId: String) = ExpiringActions.ExpiringAuthAction.async { request =>
    val identity = request.user
    val futureCollectionJson = FaciaApiIO.discardCollectionJson(collectionId, identity)
    futureCollectionJson.map { maybeCollectionJson =>
      maybeCollectionJson.foreach { b =>
      FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(DiscardUpdate(collectionId), identity.email))
      UpdateActions.archiveDiscardBlock(collectionId, b, identity)
      FaciaPress.press(PressCommand.forOneId(collectionId).withPressDraft())}
    NoCache(Ok)}}

  def treatEdits(collectionId: String) = ExpiringActions.ExpiringAuthAction.async { request =>
    request.body.asJson.flatMap(_.asOpt[FaciaToolUpdate]).map {
      case update: Update =>
        val identity = request.user
        UpdateActions.updateTreats(collectionId, update.update, identity).map(_.map{ updatedCollectionJson =>
          S3FrontsApi.putCollectionJson(collectionId, Json.prettyPrint(Json.toJson(updatedCollectionJson)))
          FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(update, identity.email))
          FaciaPress.press(PressCommand.forOneId(collectionId).withPressLive())
          Ok(Json.toJson(Map(collectionId -> updatedCollectionJson))).as("application/json")
        }.getOrElse(NotFound))

      case remove: Remove =>
        val identity = request.user
        UpdateActions.removeTreats(collectionId, remove.remove, identity).map(_.map{ updatedCollectionJson =>
          S3FrontsApi.putCollectionJson(collectionId, Json.prettyPrint(Json.toJson(updatedCollectionJson)))
          FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(remove, identity.email))
          FaciaPress.press(PressCommand.forOneId(collectionId).withPressLive())
          Ok(Json.toJson(Map(collectionId -> updatedCollectionJson))).as("application/json")
      }.getOrElse(NotFound))
      case updateAndRemove: UpdateAndRemove =>
        val identity = request.user
        val futureUpdatedCollections =
          Future.sequence(
            List(UpdateActions.updateTreats(updateAndRemove.update.id, updateAndRemove.update, identity).map(_.map(updateAndRemove.update.id -> _)),
              UpdateActions.removeTreats(updateAndRemove.remove.id, updateAndRemove.remove, identity).map(_.map(updateAndRemove.remove.id -> _))
            )).map(_.flatten.toMap)

        futureUpdatedCollections.map { updatedCollections =>
          val collectionIds = updatedCollections.keySet
          FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(updateAndRemove, identity.email))
          FaciaPress.press(PressCommand(collectionIds).withPressLive())
          Ok(Json.toJson(updatedCollections)).as("application/json")
        }
      case _ => Future.successful(NotAcceptable)
    }.getOrElse(Future.successful(NotAcceptable))
  }

  def collectionEdits(): Action[AnyContent] = ExpiringActions.ExpiringAuthAction.async { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
      request.body.asJson.flatMap (_.asOpt[FaciaToolUpdate]).map {
        case update: Update =>
          val identity = request.user

          FaciaToolUpdatesStream.putStreamUpdate(StreamUpdate(update, identity.email))

          val futureCollectionJson = UpdateActions.updateCollectionList(update.update.id, update.update, identity)
          futureCollectionJson.map { maybeCollectionJson =>
            val updatedCollections = maybeCollectionJson.map(update.update.id -> _).toMap

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
          }
        case remove: Remove =>
          val identity = request.user
          UpdateActions.updateCollectionFilter(remove.remove.id, remove.remove, identity).map { maybeCollectionJson =>
            val updatedCollections = maybeCollectionJson.map(remove.remove.id -> _).toMap
            val shouldUpdateLive: Boolean = remove.remove.live
            val collectionIds = updatedCollections.keySet
            FaciaPress.press(PressCommand(
              collectionIds,
              live = shouldUpdateLive,
              draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || remove.remove.draft)
            )
            ContentApiPush.notifyContentApi(collectionIds)
            Ok(Json.toJson(updatedCollections)).as("application/json")
          }
        case updateAndRemove: UpdateAndRemove =>
          val identity = request.user
          val futureUpdatedCollections =
            Future.sequence(
              List(UpdateActions.updateCollectionList(updateAndRemove.update.id, updateAndRemove.update, identity).map(_.map(updateAndRemove.update.id -> _)),
                 UpdateActions.updateCollectionFilter(updateAndRemove.remove.id, updateAndRemove.remove, identity).map(_.map(updateAndRemove.remove.id -> _))
            )).map(_.flatten.toMap)

          futureUpdatedCollections.map { updatedCollections =>

            val shouldUpdateLive: Boolean = updateAndRemove.remove.live || updateAndRemove.update.live
            val shouldUpdateDraft: Boolean = updateAndRemove.remove.draft || updateAndRemove.update.draft
            val collectionIds = updatedCollections.keySet
            FaciaPress.press(PressCommand(
              collectionIds,
              live = shouldUpdateLive,
              draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || shouldUpdateDraft)
            )
            ContentApiPush.notifyContentApi(collectionIds)
            Ok(Json.toJson(updatedCollections)).as("application/json")
          }
        case _ => Future.successful(NotAcceptable)
      } getOrElse Future.successful(NotFound)
  }

  def pressLivePath(path: String) = ExpiringActions.ExpiringAuthAction { request =>
    FaciaPressQueue.enqueue(PressJob(FrontPath(path), Live))
    NoCache(Ok)
  }

  def pressDraftPath(path: String) = ExpiringActions.ExpiringAuthAction { request =>
    FaciaPressQueue.enqueue(PressJob(FrontPath(path), Draft))
    NoCache(Ok)
  }

  def updateCollection(collectionId: String) = ExpiringActions.ExpiringAuthAction { request =>
    FaciaPress.press(PressCommand.forOneId(collectionId).withPressDraft().withPressLive())
    ContentApiPush.notifyContentApi(Set(collectionId))
    NoCache(Ok)
  }

  def getLastModified(path: String) = ExpiringActions.ExpiringAuthAction { request =>
    val now: Option[String] = S3FrontsApi.getPressedLastModified(path)
    now.map(Ok(_)).getOrElse(NotFound)
  }

  def generatePutForCollectionId(collectionId: String) = ExpiringActions.ExpiringAuthAction.async { request =>
    ConfigAgent.getConfig(collectionId).map { collectionConfig =>
      ContentApiWrite.generateContentApiPut(collectionId, collectionConfig).map( contentApiWrite => Ok(Json.toJson(contentApiWrite)))
    }.getOrElse(Future.successful(NotFound(s"Collection ID $collectionId does not exist in ConfigAgent")))
  }
}
