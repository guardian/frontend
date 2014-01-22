package controllers

import frontsapi.model._
import frontsapi.model.UpdateList
import play.api.mvc.{AnyContent, Action, Controller}
import play.api.libs.json._
import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import conf.Configuration
import tools.FaciaApi
import services.{ConfigAgent, ContentApiWrite}
import play.api.libs.ws.Response
import scala.concurrent.Future
import conf.Switches.ContentApiPutSwitch
import services.S3FrontsApi
import model.{NoCache, Cached}


object FaciaToolController extends Controller with Logging with ExecutionContexts {
  implicit val updateListRead = Json.reads[UpdateList]
  implicit val collectionMetaRead = Json.reads[CollectionMetaUpdate]

  def index() = ExpiringAuthentication { request =>
    val identity = Identity(request).get
    Ok(views.html.fronts(Configuration.environment.stage, Option(identity)))
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

  def readBlock(id: String) = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      S3FrontsApi.getBlock(id) map { json =>
        Ok(json).as("application/json")
      } getOrElse NotFound
    }
  }

  def getConfig(id: String) = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    Cached(60) {
      S3FrontsApi.getConfig(id) map {json =>
        Ok(json).as("application/json")
      } getOrElse NotFound
    }
  }

  def publishCollection(id: String) = AjaxExpiringAuthentication { request =>
    val identity = Identity(request).get
    FaciaToolMetrics.DraftPublishCount.increment()
    FaciaApi.publishBlock(id, identity)
    notifyContentApi(id)
    Ok
  }

  def discardCollection(id: String) = AjaxExpiringAuthentication { request =>
    val identity = Identity(request).get
    FaciaApi.discardBlock(id, identity)
    notifyContentApi(id)
    Ok
  }

  def updateCollectionMeta(id: String): Action[AnyContent] = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
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

  def updateBlock(id: String): Action[AnyContent] = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    request.body.asJson flatMap (_.asOpt[UpdateList]) map {
      case update: UpdateList => {
        val identity = Identity(request).get
        UpdateActions.updateCollectionList(id, update, identity)
        //TODO: How do we know if it was updated or created? Do we need to know?
        if (update.live) notifyContentApi(id)
        Ok
      }
      case _ => NotFound
    } getOrElse NotFound
  }

  def deleteTrail(id: String) = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    request.body.asJson flatMap (_.asOpt[UpdateList]) map {
      case update: UpdateList => {
        val identity = Identity(request).get
        UpdateActions.updateCollectionFilter(id, update, identity)
        if (update.live) notifyContentApi(id)
        Ok
      }
      case _ => NotFound
    } getOrElse NotFound
  }

  def notifyContentApi(id: String): Option[Future[Response]] =
    if (ContentApiPutSwitch.isSwitchedOn)
      ConfigAgent.getConfig(id)
        .map {config => ContentApiWrite.writeToContentapi(config)}
    else None

}
