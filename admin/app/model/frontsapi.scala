package frontsapi.model

import play.api.libs.json.{Json, JsValue}
import tools.FrontsApi
import controllers.Identity
import org.joda.time.DateTime

trait JsonShape

case class Block(
                  id: String,
                  name: Option[String],
                  live: List[Trail],
                  draft: List[Trail],
                  areEqual: Boolean,
                  lastUpdated: String,
                  updatedBy: String,
                  updatedEmail: String,
                  max: Option[Int],
                  min: Option[Int],
                  contentApiQuery: Option[String]
                  ) extends JsonShape

case class Trail(
                  id: String,
                  title: Option[String],
                  trailImage: Option[String],
                  linkText: Option[String]
                  ) extends JsonShape


case class BlockActionJson(publish: Option[Boolean], discard: Option[Boolean]) extends JsonShape
case class UpdateTrailblockJson(config: UpdateTrailblockConfigJson) extends JsonShape
case class UpdateTrailblockConfigJson(contentApiQuery: Option[String], max: Option[Int], min: Option[Int])
case class UpdateList(item: String, position: Option[String], after: Option[Boolean], live: Boolean, draft: Boolean) extends JsonShape

trait JsonExtract {
  implicit val updateListRead = Json.reads[UpdateList]
  implicit val trailActionRead = Json.reads[Trail]
  implicit val blockActionRead = Json.reads[Block]
  implicit val blockActionJsonRead = Json.reads[BlockActionJson]
  implicit val updateMetaRead = Json.reads[UpdateTrailblockConfigJson]
  implicit val updateTrailblockRead = Json.reads[UpdateTrailblockJson]

  private def extractJson(v: JsValue): Either[String, JsonShape] =
    v.asOpt[Block]
      .orElse{v.asOpt[UpdateList]}
      .orElse{v.asOpt[UpdateTrailblockJson]}
      .orElse{v.asOpt[BlockActionJson]}
      .toRight("Invalid Json")

  def build(v: JsValue) = extractJson(v).right.toOption
}

object JsonExtract extends JsonExtract

trait UpdateActions {

  lazy val defaultMinimumTrailblocks = 0
  lazy val defaultMaximumTrailblocks = 20

  def emptyTrailWithId(id: String) = Trail(id, None, None, None)

  def updateActionFilter(edition: String, section: String, blockId: String, update: UpdateList, identity: Identity): Either[String, String] =
    FrontsApi.getBlock(edition, section, blockId) map { block: Block =>
      var newBlock: Block = block.copy(lastUpdated = DateTime.now.toString, updatedBy = identity.fullName, updatedEmail = identity.email)
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
      Right("OK")
    } getOrElse Left("No edition or section") //To be more silent in the future?


  private def updateList(update: UpdateList, blocks: List[Trail]): List[Trail] = {
    val listWithoutItem = blocks.filterNot(_.id == update.item)
    val index = update.after.filter {_ == true}
      .map {_ => listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) + 1}
      .getOrElse { listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) }
    val splitList = listWithoutItem.splitAt(index)
    splitList._1 ++ List(emptyTrailWithId(update.item)) ++ splitList._2
  }

  def updateBlock(edition: String, section: String, blockId: String, update: UpdateList, identity: Identity): Unit = {
    FrontsApi.getBlock(edition, section, blockId) map { block: Block =>
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
      FrontsApi.archive(edition, section, block)
    } getOrElse {
      UpdateActions.createBlock(edition, section, blockId, identity, update)
    }
  }

  def createBlock(edition: String, section: String, block: String, identity: Identity, update: UpdateList) {
    FrontsApi.putBlock(edition, section, block, Block(block, None, List(emptyTrailWithId(update.item)), List(emptyTrailWithId(update.item)), areEqual = true, DateTime.now.toString, identity.fullName, identity.email, None, None, None))
  }

  def updateTrailblockJson(edition: String, section: String, blockId: String, updateTrailblock: UpdateTrailblockJson, identity: Identity) = {
    FrontsApi.getBlock(edition, section, blockId).map { block =>
      val newBlock = block.copy(
        contentApiQuery = updateTrailblock.config.contentApiQuery orElse None,
        min = updateTrailblock.config.min orElse Some(defaultMinimumTrailblocks),
        max = updateTrailblock.config.max orElse Some(defaultMaximumTrailblocks)
      )
      if (newBlock != block) {
        FrontsApi.putBlock(edition, section, updateIdentity(newBlock, identity))
      }
    }
  }

  def updateIdentity(block: Block, identity: Identity): Block = block.copy(lastUpdated = DateTime.now.toString, updatedBy = identity.fullName, updatedEmail = identity.email)

}

object UpdateActions extends UpdateActions