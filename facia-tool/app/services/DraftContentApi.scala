package services

import contentapi.{ContentApiClient, ElasticSearchLiveContentApiClient}
import conf.Configuration
import play.api.libs.json.{JsObject, JsValue}
import org.joda.time.DateTime

class ElasticSearchDraftContentApiClient extends ElasticSearchLiveContentApiClient {
  override val targetUrl = Configuration.contentApi.contentApiDraftHost
}

object DraftContentApi extends ElasticSearchDraftContentApiClient()

object DraftCollections extends ParseCollection {
  def retrieveItemsFromCollectionJson(collectionJson: JsValue): Seq[CollectionItem] =
    (collectionJson \ "draft").asOpt[Seq[JsObject]].orElse((collectionJson \ "live").asOpt[Seq[JsObject]]).getOrElse(Nil).map { trail =>
      CollectionItem(
        (trail \ "id").as[String],
        (trail \ "meta").asOpt[Map[String, JsValue]],
        (trail \ "frontPublicationDate").asOpt[DateTime])
    }

  override val client: ContentApiClient = DraftContentApi
}
