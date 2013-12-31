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
                  meta: Option[Map[String, JsValue]]
                  ) extends JsonShape


case class UpdateList(item: String, position: Option[String], after: Option[Boolean], itemMeta: Option[Map[String, JsValue]], live: Boolean, draft: Boolean) extends JsonShape

trait JsonExtract {
  implicit val updateListRead = Json.reads[UpdateList]
  implicit val trailActionRead = Json.reads[Trail]
  implicit val blockActionRead = Json.reads[Block]

  private def extractJson(v: JsValue): Either[String, JsonShape] =
    v.asOpt[Block]
      .orElse{v.asOpt[UpdateList]}
      .toRight("Invalid Json")

  def build(v: JsValue) = extractJson(v).right.toOption
}

object JsonExtract extends JsonExtract

trait UpdateActions {

  lazy val defaultMinimumTrailblocks = 0
  lazy val defaultMaximumTrailblocks = 20

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
      lazy val updatedLive: List[Trail] = updateList(update, block.live)

      lazy val liveCollectionWithUpdatedMeta = updateListMeta(update, updatedLive)
      lazy val draftCollectionWithUpdatedMeta = updatedDraft.map(updateListMeta(update, _))

      updateCollection(id, block, update, identity, draftCollectionWithUpdatedMeta, liveCollectionWithUpdatedMeta)
    } getOrElse {
      UpdateActions.createBlock(id, identity, update)
    }
  }

  def updateListMeta(update: UpdateList, trailList: List[Trail]): List[Trail] = {for {
      metaMap <- update.itemMeta
      } yield updateItemMetaList(update.item, trailList, metaMap)
    } getOrElse trailList

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

    splitList._1 ++ List(Trail(update.item, None)) ++ splitList._2
  }

  def createBlock(id: String, identity: Identity, update: UpdateList) {
    if (update.live)
      FaciaApi.putBlock(id, Block(id, None, List(Trail(update.item, update.itemMeta)), None, DateTime.now.toString, identity.fullName, identity.email, None), identity)
    else
      FaciaApi.putBlock(id, Block(id, None, Nil, Some(List(Trail(update.item, update.itemMeta))), DateTime.now.toString, identity.fullName, identity.email, None), identity)
  }

  def updateItemMetaList(id: String, trailList: List[Trail], metaData: Map[String, JsValue]): List[Trail] = {
    lazy val fields: Seq[String] = Seq("headline", "group", "supporting")
    lazy val newMetaMap = metaData.filter{case (k, v) => fields.contains(k)}

    for {
      trail <- trailList
      metaMap <- trail.meta.orElse(Option(Map.empty[String, JsValue]))
    } yield {
      if (id == trail.id) trail.copy(meta = Some(metaMap ++ newMetaMap)) else trail
    }
  }

}

object UpdateActions extends UpdateActions