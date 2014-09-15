package frontpress

import conf.Configuration
import contentapi.{ContentApiClient, ElasticSearchLiveContentApiClient}
import org.joda.time.DateTime
import play.api.libs.json.{JsObject, JsValue}
import services.ParseCollection

object DraftContentApi extends ElasticSearchLiveContentApiClient {
  override val targetUrl = Configuration.contentApi.contentApiDraftHost
}

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
