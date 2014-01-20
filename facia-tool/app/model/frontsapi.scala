package frontsapi.model

import play.api.libs.json.{Json, JsValue}
import tools.FaciaApi
import controllers.Identity
import org.joda.time.DateTime
import play.api.templates.HtmlFormat

case class Block(
                  id: String,
                  name: Option[String],
                  live: List[Trail],
                  draft: Option[List[Trail]],
                  lastUpdated: String,
                  updatedBy: String,
                  updatedEmail: String,
                  displayName: Option[String]
                  )

case class Trail(
                  id: String,
                  meta: Option[Map[String, JsValue]]
                  )


case class UpdateList(item: String, position: Option[String], after: Option[Boolean], itemMeta: Option[Map[String, JsValue]], live: Boolean, draft: Boolean)
case class CollectionMetaUpdate(displayName: Option[String])

trait UpdateActions {

  lazy val defaultMinimumTrailblocks = 0
  lazy val defaultMaximumTrailblocks = 20
  val itemMetaWhitelistFields: Seq[String] = Seq("headline", "trailText", "group", "supporting", "imageAdjust")

  def getBlock(id: String): Option[Block] = FaciaApi.getBlock(id)

  def insertIntoLive(update: UpdateList, block: Block): Block =
    if (update.live)
      block.copy(live=updateList(update, block.live))
    else
      block

  def insertIntoDraft(update: UpdateList, block: Block): Block =
    if (update.draft)
        block.copy(
          draft=block.draft.map {
            l => updateList(update, l)}.orElse {
              Option(updateList(update, block.live))
          }.filter(_ != block.live)
        )
    else
      block

  def deleteFromLive(update: UpdateList, block: Block): Block =
    if (update.live)
      block.copy(live=block.live.filterNot(_.id == update.item))
    else
      block

  def deleteFromDraft(update: UpdateList, block: Block): Block =
    if (update.draft)
      block.copy(draft=block.draft orElse Option(block.live) map { l => l.filterNot(_.id == update.item) } filter(_ != block.live) )
    else
      block

  def updateCollectionMeta(block: Block, update: CollectionMetaUpdate, identity: Identity): Block =
    block.copy(displayName=update.displayName)

  def putBlock(id: String, block: Block, identity: Identity): Option[Block] = {
    FaciaApi.archive(id, block)
    FaciaApi.putBlock(id, block, identity)
  }

  def updateCollectionList(id: String, update: UpdateList, identity: Identity): Option[Block] =
    getBlock(id)
      .map(insertIntoLive(update, _))
      .map(insertIntoDraft(update, _))
      .flatMap(putBlock(id, _, identity))
      .orElse(createBlock(id, identity, update))

  def updateCollectionFilter(id: String, update: UpdateList, identity: Identity): Option[Block] =
    getBlock(id)
      .map(deleteFromLive(update, _))
      .map(deleteFromDraft(update, _))
      .flatMap(putBlock(id, _, identity))

  def updateCollectionMeta(id: String, update: CollectionMetaUpdate, identity: Identity): Option[Block] =
    getBlock(id)
      .map(updateCollectionMeta(_, update, identity))
      .flatMap(putBlock(id, _, identity))

  private def updateList(update: UpdateList, blocks: List[Trail]): List[Trail] = {
    val listWithoutItem = blocks.filterNot(_.id == update.item)

    val splitList: (List[Trail], List[Trail]) = {
      //Different index logic if item is being place at itself in list
      //(Eg for metadata update, or group change, index must come from list without item removed)
      if (update.position.exists(_ == update.item)) {
        val index = blocks.indexWhere(_.id == update.item)
        listWithoutItem.splitAt(index)
      }
      else {
        val index = update.after.filter {_ == true}
          .map {_ => listWithoutItem.indexWhere(t => update.position.exists(_ == t.id)) + 1}
          .getOrElse { listWithoutItem.indexWhere(t => update.position.exists(_ == t.id)) }
        listWithoutItem.splitAt(index)
      }
    }

    splitList._1 ++ List(Trail(update.item, update.itemMeta.map(itemMetaWhiteList))) ++ splitList._2
  }

  def itemMetaWhiteList(itemMeta: Map[String, JsValue]): Map[String, JsValue] = itemMeta.filter{case (k, v) => itemMetaWhitelistFields.contains(k)}

  def createBlock(id: String, identity: Identity, update: UpdateList): Option[Block] = {
    if (update.live)
      FaciaApi.putBlock(id, Block(id, None, List(Trail(update.item, update.itemMeta)), None, DateTime.now.toString, identity.fullName, identity.email, None), identity)
    else
      FaciaApi.putBlock(id, Block(id, None, Nil, Some(List(Trail(update.item, update.itemMeta))), DateTime.now.toString, identity.fullName, identity.email, None), identity)
  }

}

object UpdateActions extends UpdateActions