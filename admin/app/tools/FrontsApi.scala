package tools

import frontsapi.model.{UpdateList, Section, Trail, Block}
import org.joda.time.DateTime
import common.{S3, S3FrontsApi}
import conf.Configuration
import play.api.libs.json.Json

trait FrontsApiRead {
  def getSchema: Option[String]
  def getBlock(edition: String, section: String, blockId: String): Option[Block]
  def getBlocksSince(since: DateTime): Seq[Block]
  def getBlocksSince(since: String): Seq[Block] = getBlocksSince(DateTime.parse(since))
}

trait FrontsApiWrite {
  def putBlock(edition: String, section: String, block: Block): Unit
  def publishBlock(edition: String, section: String, blockId: String): Unit
  def archive(edition: String, section: String, block: Block): Unit
}

object FrontsApi extends FrontsApiRead with FrontsApiWrite {
  implicit val trailRead = Json.reads[Trail]
  implicit val blockRead = Json.reads[Block]
  implicit val sectionRead = Json.reads[Section]
  implicit val updateListRead = Json.reads[UpdateList]

  implicit val trailWrite = Json.writes[Trail]
  implicit val blockWrite = Json.writes[Block]
  implicit val sectionWrite = Json.writes[Section]

  def getSchema = S3FrontsApi.getSchema
  def getBlock(edition: String, section: String, blockId: String) = for {
    blockJson <- S3FrontsApi.getBlock(edition, section, blockId)
    block <- Json.parse(blockJson).asOpt[Block]
  } yield block

  def getBlocksSince(since: DateTime) = ???

  def putBlock(edition: String, section: String, blockId: String, block: Block) = S3FrontsApi.putBlock(edition, section, blockId, Json.prettyPrint(Json.toJson(block)))
  def putBlock(edition: String, section: String, block: Block) = putBlock(edition, section, block.id, block)
  def publishBlock(edition: String, section: String, blockId: String) = getBlock(edition, section, blockId) foreach { block => putBlock(edition, section, blockId, block.copy(live = block.draft))}
  def discardBlock(edition: String, section: String, blockId: String) = getBlock(edition, section, blockId) foreach { block => putBlock(edition,section, blockId, block.copy(draft = block.live))}
  def archive(edition: String, section: String, block: Block) = S3FrontsApi.archive(edition, section, block.id, Json.prettyPrint(Json.toJson(block)))
}