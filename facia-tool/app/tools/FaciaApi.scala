package tools

import com.gu.facia.client.models.Config
import com.gu.googleauth.UserIdentity
import frontsapi.model.Block
import org.joda.time.DateTime
import play.api.libs.json.{JsValue, Json}
import services.S3FrontsApi

import scala.util.Try

trait FaciaApiRead {
  def getSchema: Option[String]
  def getBlock(id: String): Option[Block]
}

trait FaciaApiWrite {
  def putBlock(id: String, block: Block, identity: UserIdentity): Block
  def publishBlock(id: String, identity: UserIdentity): Option[Block]
  def discardBlock(id: String, identity: UserIdentity): Option[Block]
  def archive(id: String, block: Block, update: JsValue, identity: UserIdentity): Unit
}

object FaciaApi extends FaciaApiRead with FaciaApiWrite {

  def getSchema = S3FrontsApi.getSchema
  def getBlock(id: String) = for {
    blockJson <- S3FrontsApi.getBlock(id)
    block <- Json.parse(blockJson).asOpt[Block]
  } yield block

  def putBlock(id: String, block: Block, identity: UserIdentity): Block = {
    val newBlock = updateIdentity(block, identity)
    Try(S3FrontsApi.putBlock(id, Json.prettyPrint(Json.toJson(newBlock))))
    newBlock
  }

  // side effects
  def publishBlock(id: String, identity: UserIdentity): Option[Block] =
    getBlock(id)
      .flatMap(preparePublishBlock(identity))
      .map(putBlock(id, _, identity))

  // testable
  def preparePublishBlock(identity: UserIdentity)(block: Block): Option[Block] =
    Some(block)
      .filter(_.draft.isDefined)
      .map(updatePublicationDateForNew)
      .map(block => block.copy(live = block.draft.get, draft = None))
      .map(updateIdentity(_, identity))

  def discardBlock(id: String, identity: UserIdentity): Option[Block] =
    getBlock(id)
      .flatMap(prepareDiscardBlock(identity))
      .map(putBlock(id, _, identity))

  def prepareDiscardBlock(identity: UserIdentity)(block: Block): Option[Block] =
    Some(block)
      .map(_.copy(draft = None))
      .map(updateIdentity(_, identity))

  def archive(id: String, block: Block, update: JsValue, identity: UserIdentity): Unit = {
    val newBlock: Block = block.copy(diff = Some(update))
    S3FrontsApi.archive(id, Json.prettyPrint(Json.toJson(newBlock)), identity)
  }

  def putMasterConfig(config: Config): Option[Config] = {
    Try(S3FrontsApi.putMasterConfig(Json.prettyPrint(Json.toJson(config)))).map(_ => config).toOption
  }
  def archiveMasterConfig(config: Config, identity: UserIdentity): Unit = S3FrontsApi.archiveMasterConfig(Json.prettyPrint(Json.toJson(config)), identity)

  def updateIdentity(block: Block, identity: UserIdentity): Block = block.copy(lastUpdated = DateTime.now.toString, updatedBy = identity.fullName, updatedEmail = identity.email)

  def updatePublicationDateForNew(block: Block): Block = {
    val liveIds = block.live.map(_.id).toSet
    val draftsWithNewDate = block.draft.get.map {
      draft =>
        if (liveIds.contains(draft.id)) draft
        else draft.copy(frontPublicationDate = DateTime.now.getMillis)
    }
    block.copy(draft = Some(draftsWithNewDate))
  }

}
