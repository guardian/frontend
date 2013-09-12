package tools

import frontsapi.model.{Trail, Block}
import org.joda.time.DateTime
import play.api.libs.json.Json
import services.S3FrontsApi

trait FrontsApiRead {
  def getSchema: Option[String]
  def getBlock(id: String): Option[Block]
  def getBlocksSince(since: DateTime): Seq[Block]
  def getBlocksSince(since: String): Seq[Block] = getBlocksSince(DateTime.parse(since))
}

trait FrontsApiWrite {
  def putBlock(id: String, block: Block): Unit
  def publishBlock(id: String): Unit
  def archive(id: String, block: Block): Unit
}

object FrontsApi extends FrontsApiRead with FrontsApiWrite {
  implicit val trailRead = Json.reads[Trail]
  implicit val blockRead = Json.reads[Block]

  implicit val trailWrite = Json.writes[Trail]
  implicit val blockWrite = Json.writes[Block]

  def getSchema = S3FrontsApi.getSchema
  def getBlock(id: String) = for {
    blockJson <- S3FrontsApi.getBlock(id)
    block <- Json.parse(blockJson).asOpt[Block]
  } yield block

  def getBlocksSince(since: DateTime) = ???

  def putBlock(id: String, block: Block) = S3FrontsApi.putBlock(id, Json.prettyPrint(Json.toJson(block)))
  def publishBlock(id: String) = getBlock(id) foreach { block => putBlock(id, block.copy(live = block.draft, areEqual=true))}
  def discardBlock(id: String) = getBlock(id) foreach { block => putBlock(id, block.copy(draft = block.live, areEqual=true))}
  def archive(id: String, block: Block) = S3FrontsApi.archive(id, Json.prettyPrint(Json.toJson(block)))
}