package frontsapi.model

import play.api.libs.json.{Json, JsValue}
import play.api.mvc.Results.Status
import tools.FrontsApi
import controllers.Identity
import org.joda.time.DateTime

sealed case class Block(
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
                  )

sealed case class Trail(
                  id: String,
                  title: Option[String],
                  trailImage: Option[String],
                  linkText: Option[String]
                  )


case class BlockActionJson(publish: Option[Boolean], discard: Option[Boolean])

trait Update
case class Publish(id: String)
case class Discard(id: String)

case class UpdateTrailblockJson(config: UpdateTrailblockConfigJson)
case class UpdateTrailblockConfigJson(contentApiQuery: Option[String], max: Option[Int], min: Option[Int])

trait DeleteAction

case class UpdateList(item: String, position: Option[String], after: Option[Boolean], live: Boolean, draft: Boolean) {

  def updateList(update: UpdateList, blocks: List[Trail]): List[Trail] = {
    val listWithoutItem = blocks.filterNot(_.id == update.item)
    val index = update.after.filter {_ == true}
      .map {_ => listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) + 1}
      .getOrElse { listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) }
    val splitList = listWithoutItem.splitAt(index)
    splitList._1 ++ List(Trail(update.item, None, None, None)) ++ splitList._2
  }

}

object JsonExtract {
  implicit val updateListRead = Json.reads[UpdateList]
  implicit val trailActionRead = Json.reads[Trail]
  implicit val blockActionRead = Json.reads[Block]
  implicit val blockActionJsonRead = Json.reads[BlockActionJson]
  implicit val updateMetaRead = Json.reads[UpdateTrailblockConfigJson]
  implicit val updateTrailblockRead = Json.reads[UpdateTrailblockJson]

  private def extractJson(v: JsValue): Either[String, Any] =
    v.asOpt[Block]
      .orElse{v.asOpt[UpdateList]}
      .orElse{v.asOpt[UpdateTrailblockJson]}
      .orElse{v.asOpt[BlockActionJson]}
      .toRight("Invalid Json")

  def build(v: JsValue) = extractJson(v).right.toOption
}

trait UpdateActions {

  def updateActionFilter(edition: String, section: String, blockId: String, update: UpdateList): Either[String, String] =
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
      Right("OK")
    } getOrElse Left("No edition or section") //To be more silent in the future?


  private def updateList(update: UpdateList, blocks: List[Trail]): List[Trail] = {
    val listWithoutItem = blocks.filterNot(_.id == update.item)
    val index = update.after.filter {_ == true}
      .map {_ => listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) + 1}
      .getOrElse { listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) }
    val splitList = listWithoutItem.splitAt(index)
    splitList._1 ++ List(Trail(update.item, None, None, None)) ++ splitList._2
  }

  def updateBlock(edition: String, section: String, blockId: String, update: UpdateList, identity: Identity, block: Block): Unit = {
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

  def createBlock(edition: String, section: String, block: String, identity: Identity, update: UpdateList) {
    FrontsApi.putBlock(edition, section, block, Block(block, None, List(Trail(update.item, None, None, None)), List(Trail(update.item, None, None, None)), areEqual = true, DateTime.now.toString, identity.fullName, identity.email, None, None, None))
  }
}

object UpdateActions extends UpdateActions