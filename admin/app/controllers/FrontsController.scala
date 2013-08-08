package controllers

import frontsapi.model._
import frontsapi.model.Block
import frontsapi.model.Trail
import frontsapi.model.UpdateList
import play.api.mvc.{AnyContent, Action, Controller}
import play.api.libs.json._
import common.{S3FrontsApi, Logging}
import org.joda.time.DateTime
import conf.Configuration
import tools.FrontsApi


object FrontsController extends Controller with Logging {

  def index() = AuthAction{ request =>
    Ok(views.html.fronts(Configuration.environment.stage))
  }

  def schema = AuthAction{ request =>
    S3FrontsApi.getSchema map { json: String =>
      Ok(json).as("application/json")
    } getOrElse NotFound
  }

  def readBlock(edition: String, section: String, blockId: String) = AuthAction{ request =>
    S3FrontsApi.getBlock(edition, section, blockId) map { json =>
      Ok(json).as("application/json")
    } getOrElse NotFound
  }

  def updateBlock(edition: String, section: String, blockId: String): Action[AnyContent] = AuthAction { request =>
    request.body.asJson flatMap JsonExtract.build map {
      case update: UpdateList if update.item == update.position.getOrElse("") => Conflict
      case update: UpdateList => {
        val identity = Identity(request).get
        UpdateActions.updateCollectionList(edition, section, blockId, update, identity)
        //TODO: How do we know if it was updated or created? Do we need to know?
        Ok
      }
      case blockAction: BlockActionJson => {
        blockAction.publish.filter {_ == true}
          .map { _ =>
            FrontsApi.publishBlock(edition, section, blockId)
            Ok
          }
          .orElse {
          blockAction.discard.filter {_ == true}.map { _ =>
            FrontsApi.discardBlock(edition, section, blockId)
            Ok
          }
        } getOrElse NotFound("Invalid JSON")
      }
      case updateTrailblock: UpdateTrailblockJson => {
        val identity = Identity(request).get
        UpdateActions.updateTrailblockJson(edition, section, blockId, updateTrailblock, identity)
        Ok
      }
      case _ => NotFound
    } getOrElse NotFound
  }

  def updateTrail(edition: String, section: String, blockId: String, trailId: String) = AuthAction{ request =>
    request.body.asJson.map{ json =>
    }
    Ok
  }

  def deleteTrail(edition: String, section: String, blockId: String) = AuthAction { request =>
    request.body.asJson flatMap JsonExtract.build map {
      case update: UpdateList => {
        val identity = Identity(request).get
        UpdateActions.updateCollectionFilter(edition, section, blockId, update, identity)
        Ok
      }
      case _ => NotFound
    } getOrElse NotFound
  }

}
