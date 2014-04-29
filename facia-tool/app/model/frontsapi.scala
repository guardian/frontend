package frontsapi.model

import play.api.libs.json.{JsString, Json, JsValue}
import tools.FaciaApi
import controllers.Identity
import org.joda.time.DateTime
import scala.util.{Success, Failure, Try}
import common.Logging
import conf.Configuration

case class Config(
  fronts: Map[String, Front],
  collections: Map[String, Collection]
)

case class Front(
                  collections: List[String],
                  webTitle: Option[String]
                  )

case class Collection(
                  displayName: Option[String],
                  apiQuery: Option[String],
                 `type`: Option[String],
                  href: Option[String],
                  groups: Option[List[String]],
                  uneditable: Option[Boolean]
                  )

case class Block(
                  name: Option[String],
                  live: List[Trail],
                  draft: Option[List[Trail]],
                  lastUpdated: String,
                  updatedBy: String,
                  updatedEmail: String,
                  displayName: Option[String],
                  href: Option[String],
                  diff: Option[JsValue]
                  )

case class Trail(
                  id: String,
                  frontPublicationDate: Option[DateTime],
                  meta: Option[Map[String, JsValue]]
                  )


case class UpdateList(id: String, item: String, position: Option[String], after: Option[Boolean], itemMeta: Option[Map[String, JsValue]], live: Boolean, draft: Boolean)
case class CollectionMetaUpdate(
  displayName: Option[String],
  href: Option[String]
)

trait UpdateActions extends Logging {

  val collectionCap: Int = Configuration.facia.collectionCap
  val itemMetaWhitelistFields: Seq[String] = Seq("headline", "href", "snapType", "snapUri", "trailText", "group", "supporting", "imageAdjust", "isBreaking", "updatedAt")
  
  implicit val collectionMetaWrites = Json.writes[CollectionMetaUpdate]
  implicit val updateListWrite = Json.writes[UpdateList]

  def getBlock(id: String): Option[Block] = FaciaApi.getBlock(id)

  def insertIntoLive(update: UpdateList, block: Block): Block =
    if (update.live) {
      val live = updateList(update, block.live)
      block.copy(live=live, draft=block.draft.filter(_ != live))
    }
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
    block.copy(displayName=update.displayName, href=update.href)

  def putBlock(id: String, block: Block, identity: Identity): Block =
    FaciaApi.putBlock(id, block, identity)

  //Archiving
  def archivePublishBlock(id: String, block: Block, identity: Identity): Block =
    archiveBlock(id, block, "publish", identity)
  def archiveDiscardBlock(id: String, block: Block, identity: Identity): Block =
    archiveBlock(id, block, "discard", identity)

  private def archiveBlock(id: String, block: Block, action: String, identity: Identity): Block =
    archiveBlock(id, block, Json.obj("action" -> action), identity)

  def archiveUpdateBlock(id: String, block: Block, updateJson: JsValue, identity: Identity): Block =
    archiveBlock(id, block, Json.obj("action" -> "update", "update" -> updateJson), identity)
  def archiveDeleteBlock(id: String, block: Block, updateJson: JsValue, identity: Identity): Block =
    archiveBlock(id, block, Json.obj("action" -> "delete", "update" -> updateJson), identity)

  private def archiveBlock(id: String, block: Block, updateJson: JsValue, identity: Identity): Block =
    Try(FaciaApi.archive(id, block, updateJson, identity)) match {
      case Failure(t: Throwable) => {
        log.warn(t.toString)
        block
      }
      case Success(_) => block
    }

  def putMasterConfig(config: Config, identity: Identity): Option[Config] = {
    FaciaApi.archiveMasterConfig(config, identity)
    FaciaApi.putMasterConfig(config)
  }

  def updateCollectionList(id: String, update: UpdateList, identity: Identity): Option[Block] = {
    lazy val updateJson = Json.toJson(update)
    getBlock(id)
    .map(insertIntoLive(update, _))
    .map(insertIntoDraft(update, _))
    .map(capCollection)
    .map(putBlock(id, _, identity))
    .map(archiveUpdateBlock(id, _, updateJson, identity))
    .orElse(createBlock(id, identity, update))
  }

  def updateCollectionFilter(id: String, update: UpdateList, identity: Identity): Option[Block] = {
    lazy val updateJson = Json.toJson(update)
    getBlock(id)
      .map(deleteFromLive(update, _))
      .map(deleteFromDraft(update, _))
      .map(archiveDeleteBlock(id, _, updateJson, identity))
      .map(putBlock(id, _, identity))
  }

  def updateCollectionMeta(id: String, update: CollectionMetaUpdate, identity: Identity): Option[Block] =
    getBlock(id)
      .map(updateCollectionMeta(_, update, identity))
      .map(putBlock(id, _, identity))

  private def updateList(update: UpdateList, blocks: List[Trail]): List[Trail] = {
    val trail: Trail = blocks
      .find(_.id == update.item)
      .map { currentTrail =>
        val newMeta = for (updateMeta <- update.itemMeta.map(itemMetaWhiteList)) yield updateMeta
        currentTrail.copy(meta = newMeta)
      }
      .getOrElse(Trail(update.item, Option(DateTime.now), update.itemMeta.map(itemMetaWhiteList)))

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

    splitList._1 ::: (trail +: splitList._2)
  }

  def itemMetaWhiteList(itemMeta: Map[String, JsValue]): Map[String, JsValue] = itemMeta.filter{case (k, v) => itemMetaWhitelistFields.contains(k)}

  def createBlock(id: String, identity: Identity, update: UpdateList): Option[Block] = {
    if (update.live)
      Option(FaciaApi.putBlock(id, Block(None, List(Trail(update.item, Option(DateTime.now), update.itemMeta.map(itemMetaWhiteList))), None, DateTime.now.toString, identity.fullName, identity.email, None, None, None), identity))
    else
      Option(FaciaApi.putBlock(id, Block(None, Nil, Some(List(Trail(update.item, Option(DateTime.now), update.itemMeta.map(itemMetaWhiteList)))), DateTime.now.toString, identity.fullName, identity.email, None, None, None), identity))
  }

  def capCollection(block: Block): Block =
    block.copy(live = block.live.take(collectionCap), draft = block.draft.map(_.take(collectionCap)))

}

object UpdateActions extends UpdateActions
