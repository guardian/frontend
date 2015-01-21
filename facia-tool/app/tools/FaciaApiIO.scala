package tools

import com.gu.facia.client.models.{CollectionJson, ConfigJson}
import com.gu.googleauth.UserIdentity
import common.{Logging, ExecutionContexts}
import fronts.FrontsApi
import frontsapi.model.CollectionJsonFunctions
import org.joda.time.DateTime
import play.api.libs.json.{JsValue, Json}
import services.S3FrontsApi
import play.api.libs.json._
import scala.concurrent.Future
import scala.util.Try

trait FaciaApiRead {
  def getSchema: Option[String]
  def getCollectionJson(id: String): Future[Option[CollectionJson]]
}

trait FaciaApiWrite {
  def putCollectionJson(id: String, collectionJson: CollectionJson): CollectionJson
  def publishCollectionJson(id: String, identity: UserIdentity): Future[Option[CollectionJson]]
  def discardCollectionJson(id: String, identity: UserIdentity): Future[Option[CollectionJson]]
  def archive(id: String, collectionJson: CollectionJson, update: JsValue, identity: UserIdentity): Unit
}

object FaciaApiIO extends FaciaApiRead with FaciaApiWrite with ExecutionContexts with Logging {

  def getSchema = S3FrontsApi.getSchema

  def getCollectionJson(id: String): Future[Option[CollectionJson]] = FrontsApi.amazonClient.collection(id)

  def putCollectionJson(id: String, collectionJson: CollectionJson): CollectionJson = {
    Try(S3FrontsApi.putCollectionJson(id, Json.prettyPrint(Json.toJson(collectionJson))))
    collectionJson
  }

  private def mutateCollectionJson(f: UserIdentity => CollectionJson => Option[CollectionJson])
                         (id: String, identity: UserIdentity): Future[Option[CollectionJson]] =
    getCollectionJson(id)
      .map { maybeCollectionJson =>
      maybeCollectionJson
        .flatMap(f(identity))
        .map(putCollectionJson(id, _))}

  def publishCollectionJson(id: String, identity: UserIdentity) = mutateCollectionJson(FaciaApi.preparePublishCollectionJson)(id, identity)

  def discardCollectionJson(id: String, identity: UserIdentity) = mutateCollectionJson(FaciaApi.prepareDiscardCollectionJson)(id, identity)

  def archive(id: String, collectionJson: CollectionJson, update: JsValue, identity: UserIdentity): Unit = {
    Json.toJson(collectionJson).transform[JsObject](Reads.JsObjectReads) match {
      case JsSuccess(result, _) =>
        S3FrontsApi.archive(id, Json.prettyPrint(result + ("diff", update)), identity)
      case JsError(errors)  => log.warn(s"Could not archive $id: $errors")}}

  def putMasterConfig(config: ConfigJson): Option[ConfigJson] = {
    Try(S3FrontsApi.putMasterConfig(Json.prettyPrint(Json.toJson(config)))).map(_ => config).toOption
  }
  def archiveMasterConfig(config: ConfigJson, identity: UserIdentity): Unit = S3FrontsApi.archiveMasterConfig(Json.prettyPrint(Json.toJson(config)), identity)

}

/**
 * this is the pure and unit testable stuff for the FaciaApiIO
 */
object FaciaApi {

  // testable
  def preparePublishCollectionJson(identity: UserIdentity)(collectionJson: CollectionJson): Option[CollectionJson] =
    Some(collectionJson)
      .filter(_.draft.isDefined)
      .map(updatePublicationDateForNew)
      .map(CollectionJsonFunctions.updatePreviouslyForPublish)
      .map(collectionJson => collectionJson.copy(live = collectionJson.draft.get, draft = None))
      .map(updateIdentity(_, identity))

  def prepareDiscardCollectionJson(identity: UserIdentity)(collectionJson: CollectionJson): Option[CollectionJson] =
    Some(collectionJson)
      .map(_.copy(draft = None))
      .map(updateIdentity(_, identity))

  def updateIdentity(collectionJson: CollectionJson, identity: UserIdentity): CollectionJson = collectionJson.copy(lastUpdated = DateTime.now, updatedBy = identity.fullName, updatedEmail = identity.email)

  def updatePublicationDateForNew(collectionJson: CollectionJson): CollectionJson = {
    val liveIds = collectionJson.live.map(_.id).toSet
    val draftsWithNewDate = collectionJson.draft.get.map {
      draft =>
        if (liveIds.contains(draft.id)) draft
        else draft.copy(frontPublicationDate = DateTime.now.getMillis)
    }
    collectionJson.copy(draft = Some(draftsWithNewDate))
  }

}
