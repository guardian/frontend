package frontpress

import com.gu.facia.client.models.Trail
import conf.Configuration
import contentapi.{ContentApiClient, ElasticSearchLiveContentApiClient}
import services.ParseCollection

object DraftContentApi extends ElasticSearchLiveContentApiClient {
  override val targetUrl = Configuration.contentApi.contentApiDraftHost
}

object DraftCollections extends ParseCollection {
  def retrieveItemsFromCollectionJson(collection: com.gu.facia.client.models.Collection): Seq[Trail] =
    collection.draft.getOrElse(Nil)

  override val client: ContentApiClient = DraftContentApi
}
