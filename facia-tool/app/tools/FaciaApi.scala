package tools

import frontsapi.model.{Trail, Block}
import org.joda.time.DateTime
import play.api.libs.json.Json
import services.S3FrontsApi
import controllers.Identity

trait FaciaApiRead {
  def getSchema: Option[String]
  def getBlock(id: String): Option[Block]
  def getBlocksSince(since: DateTime): Seq[Block]
  def getBlocksSince(since: String): Seq[Block] = getBlocksSince(DateTime.parse(since))
}

trait FaciaApiWrite {
  def putBlock(id: String, block: Block, identity: Identity): Unit
  def publishBlock(id: String, identity: Identity): Unit
  def discardBlock(id: String, identity: Identity): Unit
  def archive(id: String, block: Block): Unit
}

object FaciaApi extends FaciaApiRead with FaciaApiWrite {
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

  def putBlock(id: String, block: Block, identity: Identity) = {
    val newBlock = updateIdentity(block, identity)
    S3FrontsApi.putBlock(id, Json.prettyPrint(Json.toJson(newBlock)))
  }
  def publishBlock(id: String, identity: Identity) = getBlock(id) map (updateIdentity(_, identity)) foreach { block => putBlock(id, block.copy(live = block.draft.getOrElse(Nil), draft = None), identity)}
  def discardBlock(id: String, identity: Identity) = getBlock(id) map (updateIdentity(_, identity)) foreach { block => putBlock(id, block.copy(draft = None), identity)}
  def archive(id: String, block: Block) = S3FrontsApi.archive(id, Json.prettyPrint(Json.toJson(block)))

  def updateIdentity(block: Block, identity: Identity): Block = block.copy(lastUpdated = DateTime.now.toString, updatedBy = identity.fullName, updatedEmail = identity.email)
}