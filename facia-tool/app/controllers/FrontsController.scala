package controllers

import frontsapi.model._
import frontsapi.model.UpdateList
import play.api.mvc.{AnyContent, Action, Controller}
import play.api.libs.json._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import tools.FrontsApi
import scala.concurrent.Future
import services.S3FrontsApi


object FrontsController extends Controller with Logging with ExecutionContexts {

  def index() = AuthAction{ request =>
    Ok(views.html.fronts(Configuration.environment.stage))
  }

  def listCollections = AuthAction { request =>
    Async {
      Future{
        Ok(Json.toJson(S3FrontsApi.listCollectionIds))
      }
    }
  }

  def listConfigs = AuthAction { request =>
    Async {
      Future{
        Ok(Json.toJson(S3FrontsApi.listConfigsIds))
      }
    }
  }

  def readBlock(id: String) = AuthAction{ request =>
    S3FrontsApi.getBlock(id) map { json =>
      Ok(json).as("application/json")
    } getOrElse NotFound
  }

  def getConfig(id: String) = AuthAction{ request =>
    S3FrontsApi.getConfig(id) map { json =>
      Ok(json).as("application/json")
    } getOrElse NotFound
  }

  def updateBlock(id: String): Action[AnyContent] = AuthAction { request =>
    request.body.asJson flatMap JsonExtract.build map {
      case update: UpdateList if update.item == update.position.getOrElse("") => Conflict
      case update: UpdateList => {
        val identity = Identity(request).get
        UpdateActions.updateCollectionList(id, update, identity)
        //TODO: How do we know if it was updated or created? Do we need to know?
        Ok
      }
      case blockAction: BlockActionJson => {
        val identity = Identity(request).get
        blockAction.publish.filter {_ == true}
          .map { _ =>
            FrontsApi.publishBlock(id, identity)
            Ok
          }
          .orElse {
          blockAction.discard.filter {_ == true}.map { _ =>
            FrontsApi.discardBlock(id, identity)
            Ok
          }
        } getOrElse NotFound("Invalid JSON")
      }
      case updateTrailblock: UpdateTrailblockJson => {
        val identity = Identity(request).get
        UpdateActions.updateTrailblockJson(id, updateTrailblock, identity)
        Ok
      }
      case _ => NotFound
    } getOrElse NotFound
  }

  def updateTrail(id: String, trailId: String) = AuthAction{ request =>
    request.body.asJson.map{ json =>
    }
    Ok
  }

  def deleteTrail(id: String) = AuthAction { request =>
    request.body.asJson flatMap JsonExtract.build map {
      case update: UpdateList => {
        val identity = Identity(request).get
        UpdateActions.updateCollectionFilter(id, update, identity)
        Ok
      }
      case _ => NotFound
    } getOrElse NotFound
  }

}
