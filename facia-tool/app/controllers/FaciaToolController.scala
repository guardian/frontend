package controllers

import frontsapi.model._
import frontsapi.model.UpdateList
import play.api.mvc.{AnyContent, Action, Controller}
import play.api.libs.json._
import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import conf.Configuration
import tools.FaciaApi
import services.S3FrontsApi
import play.api.libs.ws.WS


object FaciaToolController extends Controller with Logging with ExecutionContexts {

  def index() = ExpiringAuthentication { request =>
    Ok(views.html.fronts(Configuration.environment.stage))
  }

  def admin() = ExpiringAuthentication { request =>
    Redirect("/")
  }

  def listCollections = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    Ok(Json.toJson(S3FrontsApi.listCollectionIds))
  }

  def listConfigs = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    Ok(Json.toJson(S3FrontsApi.listConfigsIds))
  }

  def readBlock(id: String) = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    S3FrontsApi.getBlock(id) map { json =>
      Ok(json).as("application/json")
    } getOrElse NotFound
  }

  def getConfig(id: String) = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    S3FrontsApi.getConfig(id) map {json =>
      Ok(json).as("application/json")
    } getOrElse NotFound
  }


  def updateBlock(id: String): Action[AnyContent] = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    request.body.asJson flatMap JsonExtract.build map {
      case update: UpdateList => {
        val identity = Identity(request).get
        UpdateActions.updateCollectionList(id, update, identity)
        //TODO: How do we know if it was updated or created? Do we need to know?
        notifyContentApi(id)
        Ok
      }
      case blockAction: BlockActionJson => {
        val identity = Identity(request).get
        blockAction.publish.filter {_ == true}
          .map { _ =>
            FaciaToolMetrics.DraftPublishCount.increment()
            FaciaApi.publishBlock(id, identity)
            notifyContentApi(id)
            Ok
          }
          .orElse {
          blockAction.discard.filter {_ == true}.map { _ =>
            FaciaApi.discardBlock(id, identity)
            notifyContentApi(id)
            Ok
          }
        } getOrElse NotFound("Invalid JSON")
      }
      case updateTrailblock: UpdateTrailblockJson => {
        val identity = Identity(request).get
        UpdateActions.updateTrailblockJson(id, updateTrailblock, identity)
        notifyContentApi(id)
        Ok
      }
      case _ => NotFound
    } getOrElse NotFound
  }

  def updateTrail(id: String, trailId: String) = AjaxExpiringAuthentication { request =>
    request.body.asJson.map{ json =>
    }
    Ok
  }

  def deleteTrail(id: String) = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    request.body.asJson flatMap JsonExtract.build map {
      case update: UpdateList => {
        val identity = Identity(request).get
        UpdateActions.updateCollectionFilter(id, update, identity)
        notifyContentApi(id)
        Ok
      }
      case _ => NotFound
    } getOrElse NotFound
  }

  def notifyContentApi(id: String): Unit = {
    Configuration.faciatool.contentApiPostEndpoint map { postUrl =>
      val url = "%s/collection/%s".format(postUrl, id)
      val r = WS.url(url).post("")
      r.onSuccess{case s => log.info("Content API POST: %s %s".format(s.status.toString, s.body))}
      r.onFailure{case e: Throwable => log.error("Error posting to Content API: %s".format(e.toString))}
    }
  }

}
