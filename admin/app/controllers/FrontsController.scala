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
        FrontsApi.getBlock(edition, section, blockId).map { block =>
          UpdateActions.updateBlock(edition, section, blockId, update, identity, block)
          FrontsApi.archive(edition, section, block)
          Ok
        } getOrElse {
          UpdateActions.createBlock(edition, section, blockId, identity, update)
          Created
        }
      }
      case blockAction: BlockActionJson => {
        blockAction.publish.filter {_ == true}
          .map { _ => FrontsApi.publishBlock(edition, section, blockId) }
          .orElse {
          blockAction.discard.filter {_ == true}.map(_ => FrontsApi.discardBlock(edition, section, blockId))
        } getOrElse NotFound("Invalid JSON")
        Ok
      }
      case updateTrailblock: UpdateTrailblockJson => {
        FrontsApi.getBlock(edition, section, blockId).map { block =>
          val newBlock = block.copy(
            contentApiQuery = updateTrailblock.config.contentApiQuery orElse None,
            //These defaults will move somewhere better during refactor
            min = updateTrailblock.config.min orElse Some(0),
            max = updateTrailblock.config.max orElse Some(20)
          )
          FrontsApi.putBlock(edition, section, newBlock)
          Ok
        } getOrElse NotFound
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
        UpdateActions.updateActionFilter(edition, section, blockId, update)
        Ok
      }
      case _ => NotFound
    } getOrElse NotFound
  }

}
