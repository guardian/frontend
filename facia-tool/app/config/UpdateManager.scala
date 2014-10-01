package config

import com.gu.facia.client.models.{CollectionConfig, Config, Front}
import controllers.CreateFront
import frontsapi.model.UpdateActions
import services.{IdGeneration, ConfigAgent, S3FrontsApi}
import play.api.libs.json.Json
import util.SanitizeInput
import com.gu.googleauth.UserIdentity

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
  private def transformConfig(transform: Config => Config, identity: UserIdentity): Unit = {
    S3FrontsApi.getMasterConfig map { configString =>
      val configJson = Json.parse(configString)
      val config = configJson.asOpt[Config] getOrElse {
        throw new RuntimeException(s"Unable to de-serialize config from S3: $configJson")
      }

      val transformedConfig: Config = transform(config)
      val newConfig = SanitizeInput.fromConfigSeo(Transformations.prune(transformedConfig))
      UpdateActions.putMasterConfig(newConfig, identity)
      ConfigAgent.refreshWith(transformedConfig)
    }
  }

  def createFront(request: CreateFront, identity: UserIdentity): String = {
    val newCollectionId = IdGeneration.nextId
    transformConfig(Transformations.createFront(request, newCollectionId), identity)
    newCollectionId
  }

  def updateFront(id: String, newVersion: Front, identity: UserIdentity): Unit = {
    transformConfig(Transformations.updateFront(id, newVersion), identity)
  }

  def addCollection(frontIds: List[String], collection: CollectionConfig, identity: UserIdentity): String = {
    val newCollectionId = IdGeneration.nextId
    transformConfig(Transformations.updateCollection(frontIds, newCollectionId, collection), identity)
    newCollectionId
  }

  def updateCollection(id: String, frontIds: List[String], collection: CollectionConfig, identity: UserIdentity): Unit = {
    transformConfig(Transformations.updateCollection(frontIds, id, collection), identity)
  }
}
