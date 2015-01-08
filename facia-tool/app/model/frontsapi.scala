package frontsapi.model

import com.gu.facia.client.models.{ConfigJson, Trail, TrailMetaData}
import com.gu.googleauth.UserIdentity
import common.Logging
import conf.Configuration
import julienrf.variants.Variants
import org.joda.time.DateTime
import play.api.libs.json.{JsString, Format, JsValue, Json}
import services.ConfigAgent
import tools.{FaciaApi, FaciaApiIO}

import scala.util.{Failure, Success, Try}

object Block {
  implicit val jsonFormat = Json.format[Block]
}

case class Block(
                  name: Option[String],
                  live: List[Trail],
                  draft: Option[List[Trail]],
                  lastUpdated: String,
                  updatedBy: String,
                  updatedEmail: String,
                  displayName: Option[String],
                  href: Option[String],
                  diff: Option[JsValue],
                  previously: Option[List[Trail]]
                  ) {

  def sortByGroup: Block = this.copy(
    live = sortTrailsByGroup(this.live),
    draft = this.draft.map(sortTrailsByGroup)
  )

  private def sortTrailsByGroup(trails: List[Trail]): List[Trail] = {
    val trailGroups = trails.groupBy(_.meta.flatMap(_.group).map(_.toInt).getOrElse(0))
    trailGroups.keys.toList.sorted(Ordering.Int.reverse).flatMap(trailGroups.getOrElse(_, Nil))
  }

  def updatePreviously(update: UpdateList): Block = {
    if (update.live) {
      val itemFromLive: Option[Trail] = live.find(_.id == update.item)
      val updatedPreviously: Option[List[Trail]] =
        (for {
          previousList <- previously
          trail <- itemFromLive
        } yield {
          val previouslyWithoutItem: List[Trail] = previousList.filterNot(_.id == update.item)
          (trail +: previouslyWithoutItem).take(20)
        }).orElse(itemFromLive.map(List.apply(_)))
      this.copy(previously=updatedPreviously)
    }
    else
      this
  }

  def updatePreviouslyForPublish(): Block = {
    val removed: List[Trail] = live.filterNot(t => draft.getOrElse(Nil).exists(_.id == t.id))
    val updatedPreviously = previously
      .map(_.filterNot(t => removed.exists(_.id == t.id)))
      .map(removed ++ _)
      .orElse(Option(removed))
      .map(_.take(20))
    this.copy(previously=updatedPreviously)
  }
}

sealed trait FaciaToolUpdate

case class UpdateList(
  id: String,
  item: String,
  position: Option[String],
  after: Option[Boolean],
  itemMeta: Option[TrailMetaData],
  live: Boolean,
  draft: Boolean
) extends FaciaToolUpdate

case class Update(update: UpdateList) extends FaciaToolUpdate
case class Remove(remove: UpdateList) extends FaciaToolUpdate

case class UpdateAndRemove(update: UpdateList, remove: UpdateList) extends FaciaToolUpdate

case class DiscardUpdate(id: String) extends FaciaToolUpdate
case class PublishUpdate(id: String) extends FaciaToolUpdate

object UpdateList {
  implicit val format: Format[UpdateList] = Json.format[UpdateList]
}

object FaciaToolUpdate {
  implicit val format: Format[FaciaToolUpdate] = Variants.format[FaciaToolUpdate]("type")
}

case class StreamUpdate(update: FaciaToolUpdate, email: String)

object StreamUpdate {
  implicit val streamUpdateFormat: Format[StreamUpdate] = Json.format[StreamUpdate]
}

trait UpdateActions extends Logging {

  val collectionCap: Int = Configuration.facia.collectionCap
  implicit val updateListWrite = Json.writes[UpdateList]

  def getBlock(id: String): Option[Block] = FaciaApiIO.getBlock(id)

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

  def putBlock(id: String, block: Block): Block =
    FaciaApiIO.putBlock(id, block)

  //Archiving
  def archivePublishBlock(id: String, block: Block, identity: UserIdentity): Block =
    archiveBlock(id, block, "publish", identity)

  def archiveDiscardBlock(id: String, block: Block, identity: UserIdentity): Block =
    archiveBlock(id, block, "discard", identity)

  private def archiveBlock(id: String, block: Block, action: String, identity: UserIdentity): Block =
    archiveBlock(id, block, Json.obj("action" -> action), identity)

  def archiveUpdateBlock(id: String, block: Block, updateJson: JsValue, identity: UserIdentity): Block =
    archiveBlock(id, block, Json.obj("action" -> "update", "update" -> updateJson), identity)
  def archiveDeleteBlock(id: String, block: Block, updateJson: JsValue, identity: UserIdentity): Block =
    archiveBlock(id, block, Json.obj("action" -> "delete", "update" -> updateJson), identity)

  private def archiveBlock(id: String, block: Block, updateJson: JsValue, identity: UserIdentity): Block =
    Try(FaciaApiIO.archive(id, block, updateJson, identity)) match {
      case Failure(t: Throwable) => {
        log.warn(t.toString)
        block
      }
      case Success(_) => block
    }

  def putMasterConfig(config: ConfigJson, identity: UserIdentity): Option[ConfigJson] = {
    FaciaApiIO.archiveMasterConfig(config, identity)
    FaciaApiIO.putMasterConfig(config)
  }

  def updateCollectionList(id: String, update: UpdateList, identity: UserIdentity): Option[Block] = {
    lazy val updateJson = Json.toJson(update)
    getBlock(id)
    .map(insertIntoLive(update, _))
    .map(insertIntoDraft(update, _))
    .map(removeGroupIfNoLongerGrouped(id, _))
    .map(pruneBlock)
    .map(_.sortByGroup)
    .map(capCollection)
    .map(FaciaApi.updateIdentity(_, identity))
    .map(putBlock(id, _))
    .map(archiveUpdateBlock(id, _, updateJson, identity))
    .orElse(createBlock(id, identity, update))
  }

  def updateCollectionFilter(id: String, update: UpdateList, identity: UserIdentity): Option[Block] = {
    lazy val updateJson = Json.toJson(update)
    getBlock(id)
      .map(_.updatePreviously(update))
      .map(deleteFromLive(update, _))
      .map(deleteFromDraft(update, _))
      .map(removeGroupIfNoLongerGrouped(id, _))
      .map(pruneBlock)
      .map(_.sortByGroup)
      .map(archiveDeleteBlock(id, _, updateJson, identity))
      .map(FaciaApi.updateIdentity(_, identity))
      .map(putBlock(id, _))
  }

  private def updateList(update: UpdateList, blocks: List[Trail]): List[Trail] = {
    val trail: Trail = blocks
      .find(_.id == update.item)
      .map { currentTrail =>
        val newMeta = for (updateMeta <- update.itemMeta) yield updateMeta
        currentTrail.copy(meta = newMeta)
      }
      .getOrElse(Trail(update.item, DateTime.now.getMillis, update.itemMeta))

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

  def createBlock(id: String, identity: UserIdentity, update: UpdateList): Option[Block] = {
    if (update.live)
      Option(FaciaApiIO.putBlock(id, Block(None, List(Trail(update.item, DateTime.now.getMillis, update.itemMeta)), None, DateTime.now.toString, identity.fullName, identity.email, None, None, None, None)))
    else
      Option(FaciaApiIO.putBlock(id, Block(None, Nil, Some(List(Trail(update.item, DateTime.now.getMillis, update.itemMeta))), DateTime.now.toString, identity.fullName, identity.email, None, None, None, None)))
  }

  def capCollection(block: Block): Block =
    block.copy(live = block.live.take(collectionCap), draft = block.draft.map(_.take(collectionCap)))

  def removeGroupIfNoLongerGrouped(collectionId: String, block: Block): Block = {
    ConfigAgent.getConfig(collectionId).flatMap(_.groups) match {
      case Some(groups) if groups.nonEmpty => block
      case _ => block.copy(
        live = block.live.map(removeGroupsFromTrail),
        draft = block.draft.map(_.map(removeGroupsFromTrail)))
    }
  }

  private def pruneBlock(block: Block): Block =
    block.copy(
      live = block.live
        .map(pruneGroupOfZero)
        .map(pruneMetaDataIfEmpty),
      draft = block.draft.map(
        _.map(pruneGroupOfZero)
         .map(pruneMetaDataIfEmpty)
      )
    )

  private def pruneGroupOfZero(trail: Trail): Trail =
    trail.copy(meta = trail.meta.map(
      metaData => metaData.copy(json = metaData.json.filter{
        case ("group", JsString("0")) => false
        case _ => true})))

  private def pruneMetaDataIfEmpty(trail: Trail): Trail =
    trail.copy(meta = trail.meta.filter(_.json.nonEmpty))

  private def removeGroupsFromTrail(trail: Trail): Trail =
    trail.copy(meta = trail.meta.map(metaData => metaData.copy(json = metaData.json - "group")))
}

object UpdateActions extends UpdateActions
