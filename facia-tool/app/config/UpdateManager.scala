package config

import controllers.{Identity, CreateFront}
import frontsapi.model.{UpdateActions, Collection, Config, Front}
import services.S3FrontsApi
import play.api.libs.json.Json
import util.SanitizeInput

object UpdateManager {
  /**
   * To attempt to alleviate the problem of concurrent updates stomping one another, we reload the config from S3,
   * apply the change, then write it back.
   *
   * Although this will work as a palliative measure it does not solve the underlying problem, which is that something
   * that is being edited at quite a granular level is being written to and from persistence in one large data
   * structure.
   *
   * In the future we should look at separating out the config into a more appropriate representation.
   *
   * @param transform The transformation to apply
   */
  private def transformConfig(transform: Config => Config, identity: Identity) {
    S3FrontsApi.getMasterConfig map { configJson =>
      val config = Json.parse(configJson).asOpt[Config] getOrElse {
        throw new RuntimeException(s"Unable to de-serialize config from S3: $configJson")
      }

      val newConfig = SanitizeInput.fromConfigSeo(Transformations.prune(transform(config)))
      UpdateActions.putMasterConfig(newConfig, identity)
    }
  }

  def createFront(request: CreateFront, identity: Identity) = {
    val newCollectionId = Collection.nextId
    transformConfig(Transformations.createFront(request, newCollectionId), identity)
    newCollectionId
  }

  def updateFront(id: String, newVersion: Front, identity: Identity) {
    transformConfig(Transformations.updateFront(id, newVersion), identity)
  }

  def addCollection(frontIds: List[String], collection: Collection, identity: Identity) = {
    val newCollectionId = Collection.nextId
    transformConfig(Transformations.updateCollection(frontIds, newCollectionId, collection), identity)
    newCollectionId
  }

  def updateCollection(id: String, frontIds: List[String], collection: Collection, identity: Identity) {
    transformConfig(Transformations.updateCollection(frontIds, id, collection), identity)
  }
}
