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
  def retrieveItemsFromCollectionJson(collection: com.gu.facia.client.models.Collection): Seq[CollectionItem] =
    collection.draft.getOrElse(Nil).map { trail =>
      CollectionItem(
        trail.id,
        trail.meta,
        Option(new DateTime(trail.frontPublicationDate)))
    }

  override val client: ContentApiClient = DraftContentApi
}
