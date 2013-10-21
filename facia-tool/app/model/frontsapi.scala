package frontsapi.model

import play.api.libs.json.{Json, JsValue}
import tools.FaciaApi
import controllers.Identity
import org.joda.time.DateTime
import play.api.templates.HtmlFormat

trait JsonShape

case class Block(
                  id: String,
                  name: Option[String],
                  live: List[Trail],
                  draft: Option[List[Trail]],
                  lastUpdated: String,
                  updatedBy: String,
                  updatedEmail: String,
                  displayName: Option[String]
                  ) extends JsonShape

case class Trail(
                  id: String,
                  title: Option[String],
                  trailImage: Option[String],
                  linkText: Option[String],
                  meta: Option[Map[String, String]]
                  ) extends JsonShape


case class BlockActionJson(publish: Option[Boolean], discard: Option[Boolean]) extends JsonShape
case class UpdateTrailblockJson(config: UpdateTrailblockConfigJson) extends JsonShape
case class UpdateTrailblockConfigJson(contentApiQuery: Option[String], max: Option[Int], min: Option[Int], displayName: Option[String])
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

  def shouldUpdate[T](cond: Boolean, original: T, updated: => T) = if (cond) updated else original

  def updateCollectionFilter(id: String, update: UpdateList, identity: Identity) = {
    FaciaApi.getBlock(id) map { block: Block =>
      lazy val updatedLive = block.live.filterNot(_.id == update.item)
      lazy val updatedDraft = block.draft map { l =>
        l.filterNot(_.id == update.item)
      } orElse Some(updatedLive)
      updateCollection(id, block, update, identity, updatedDraft, updatedLive)
    }
  }

  def updateCollectionList(id: String, update: UpdateList, identity: Identity) = {
    FaciaApi.getBlock(id) map { block: Block =>
      lazy val updatedDraft: Option[List[Trail]] = block.draft map { l =>
        updateList(update, l)
      } orElse {if (update.draft) Some(updateList(update, block.live)) else None}
      lazy val updatedLive = updateList(update, block.live)
      updateCollection(id, block, update, identity, updatedDraft, updatedLive)
    } getOrElse {
      UpdateActions.createBlock(id, identity, update)
    }
  }

  def updateCollection(id: String, block: Block, update: UpdateList, identity: Identity, updatedDraft: => Option[List[Trail]], updatedLive: => List[Trail]): Unit = {
      val live = shouldUpdate(update.live, block.live, updatedLive)
      val draft = shouldUpdate(update.draft, block.draft, updatedDraft) filter {_ != live}

      val newBlock =
        block.copy(draft = draft)
             .copy(live = live)

      FaciaApi.putBlock(id, newBlock, identity)
      FaciaApi.archive(id, block)
  }

  private def updateList(update: UpdateList, blocks: List[Trail]): List[Trail] = {
    val listWithoutItem = blocks.filterNot(_.id == update.item)
    val index = update.after.filter {_ == true}
      .map {_ => listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) + 1}
      .getOrElse { listWithoutItem.indexWhere(_.id == update.position.getOrElse("")) }
    val splitList = listWithoutItem.splitAt(index)
    splitList._1 ++ List(emptyTrailWithId(update.item)) ++ splitList._2
  }

  def createBlock(id: String, identity: Identity, update: UpdateList) {
    if (update.live)
      FaciaApi.putBlock(id, Block(id, None, List(emptyTrailWithId(update.item)), None, DateTime.now.toString, identity.fullName, identity.email, None), identity)
    else
      FaciaApi.putBlock(id, Block(id, None, Nil, Some(List(emptyTrailWithId(update.item))), DateTime.now.toString, identity.fullName, identity.email, None), identity)
  }

  def updateTrailblockJson(id: String, updateTrailblock: UpdateTrailblockJson, identity: Identity) = {
    FaciaApi.getBlock(id).map { block =>
      val newBlock = block.copy(
        displayName = updateTrailblock.config.displayName map HtmlFormat.escape map (_.body)
      )
      if (newBlock != block) {
        FaciaApi.putBlock(id, newBlock, identity)
      }
    } getOrElse {
      val newBlock = Block(id, None, Nil, None, DateTime.now.toString, identity.fullName, identity.email, updateTrailblock.config.displayName)
      FaciaApi.putBlock(id, newBlock, identity)
    }
  }
}

object UpdateActions extends UpdateActions