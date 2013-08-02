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
  implicit val updateListRead = Json.reads[UpdateList]
  implicit val blockActionRead = Json.reads[BlockAction]
  implicit val updateMetaRead = Json.reads[UpdateTrailblockConfig]
  implicit val updateTrailblockRead = Json.reads[UpdateTrailblock]

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

  def updateBlock(edition: String, section: String, blockId: String): Action[AnyContent] = AuthAction{ request =>
    request.body.asJson.map { json =>
        json.asOpt[UpdateList].map { update: UpdateList =>
            if (update.item == update.position.getOrElse(""))
              Conflict
            else {
              val identity = Identity(request).get
              FrontsApi.getBlock(edition, section, blockId).map { block =>
                  updateBlock(edition, section, blockId, update, identity, block)
                  FrontsApi.archive(edition, section, block)
                  Ok
              } getOrElse {
                createBlock(edition, section, blockId, identity, update)
                Created
              }
            }
        } orElse json.asOpt[UpdateTrailblock]
          .map {update =>
            FrontsApi.getBlock(edition, section, blockId).map { block =>
              val newBlock = block.copy(
                contentApiQuery = update.config.contentApiQuery orElse block.contentApiQuery,
                //These defaults will move somewhere better during refactor
                min = update.config.min orElse Some(0),
                max = update.config.max orElse Some(20)
              )
              FrontsApi.putBlock(edition, section, newBlock)
              Ok
            } getOrElse NotFound
        } orElse json.asOpt[BlockAction]
          .map {blockAction => blockAction
          blockAction.publish.filter {_ == true}
            .map { _ => FrontsApi.publishBlock(edition, section, blockId) }
            .orElse {
            blockAction.discard.filter {_ == true}.map(_ => FrontsApi.discardBlock(edition, section, blockId))
          } getOrElse NotFound("Invalid JSON")
          Ok
        } getOrElse NotFound("Invalid JSON")
    } getOrElse NotFound("Problem parsing json")
  }

  private def updateBlock(edition: String, section: String, blockId: String, update: UpdateList, identity: Identity, block: Block): Unit = {
    var newBlock: Block = block.copy(lastUpdated = DateTime.now.toString, updatedBy = identity.fullName, updatedEmail = identity.email)
    if (update.draft) {
      val trails = updateList(update, block.draft)
      newBlock = newBlock.copy(draft = trails)
    }
    if (update.live) {
      val trails = updateList(update, block.live)
      newBlock = newBlock.copy(live = trails)
    }

    newBlock = newBlock.copy(areEqual = newBlock.live==newBlock.draft)

    FrontsApi.putBlock(edition, section, blockId, newBlock)
  }

  private def updateList(update: UpdateList, blocks: List[Trail]): List[Trail] = {
    val listWithoutItem = blocks.filterNot(_.id == update.item)
    val index = update.after.filter {_ == true}
      .map {_ => listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) + 1}
      .getOrElse { listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) }
    val splitList = listWithoutItem.splitAt(index)
    splitList._1 ++ List(Trail(update.item, None, None, None)) ++ splitList._2
  }

  private def createBlock(edition: String, section: String, block: String, identity: Identity, update: UpdateList) {
      FrontsApi.putBlock(edition, section, block, Block(block, None, List(Trail(update.item, None, None, None)), List(Trail(update.item, None, None, None)), areEqual=true, DateTime.now.toString, identity.fullName, identity.email, None, None, None))
  }
  /**
   * @todo
   */
  def updateTrail(edition: String, section: String, blockId: String, trailId: String) = AuthAction{ request =>
    request.body.asJson.map{ json =>
    }
    Ok
  }

  def deleteTrail(edition: String, section: String, blockId: String) = AuthAction { request =>
    request.body.asJson.map { json =>
      json.asOpt[UpdateList].map { update: UpdateList =>
        FrontsApi.getBlock(edition, section, blockId) map { block: Block =>
          var newBlock = block.copy()
          if (update.draft) {
            val trails = block.draft.filterNot(_.id == update.item)
            newBlock = newBlock.copy(draft = trails)
          }
          if (update.live) {
            val trails = block.live.filterNot(_.id == update.item)
            newBlock = newBlock.copy(live = trails)
          }
          newBlock = newBlock.copy(areEqual = newBlock.live==newBlock.draft)

          FrontsApi.putBlock(edition, section, block.id, newBlock)
          Ok
        } getOrElse NotFound("No edition or section") //To be more silent in the future?
      } getOrElse NotFound("Invalid JSON")
    } getOrElse NotFound("Problem parsing json")
  }

}
