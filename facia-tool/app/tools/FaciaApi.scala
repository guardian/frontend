package tools

import com.gu.facia.client.models.Config
import frontsapi.model.Block
import org.joda.time.DateTime
import play.api.libs.json.{JsValue, Json}
import services.S3FrontsApi
import scala.util.Try
import com.gu.googleauth.UserIdentity

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

  def publishBlock(id: String, identity: UserIdentity): Option[Block] =
    getBlock(id)
      .filter(_.draft.isDefined)
      .map(updateIdentity(_, identity))
      .map { block => putBlock(id, block.copy(live = block.draft.get, draft = None), identity)}

  def discardBlock(id: String, identity: UserIdentity): Option[Block] =
    getBlock(id)
      .map (updateIdentity(_, identity))
      .map { block => putBlock(id, block.copy(draft = None), identity)}

  def archive(id: String, block: Block, update: JsValue, identity: UserIdentity): Unit = {
    val newBlock: Block = block.copy(diff = Some(update))
    S3FrontsApi.archive(id, Json.prettyPrint(Json.toJson(newBlock)), identity)
  }

  def putMasterConfig(config: Config): Option[Config] = {
    Try(S3FrontsApi.putMasterConfig(Json.prettyPrint(Json.toJson(config)))).map(_ => config).toOption
  }
  def archiveMasterConfig(config: Config, identity: UserIdentity): Unit = S3FrontsApi.archiveMasterConfig(Json.prettyPrint(Json.toJson(config)), identity)

  def updateIdentity(block: Block, identity: UserIdentity): Block = block.copy(lastUpdated = DateTime.now.toString, updatedBy = identity.fullName, updatedEmail = identity.email)
}