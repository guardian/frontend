package frontpress

import com.gu.facia.client.models.Trail
import conf.Configuration
import contentapi.{ContentApiClient, LiveContentApiClient}
import services.ParseCollection

object DraftContentApi extends LiveContentApiClient {
  override val targetUrl = Configuration.contentApi.contentApiDraftHost
}

object DraftCollections extends ParseCollection {
  def retrieveItemsFromCollectionJson(collection: com.gu.facia.client.models.CollectionJson): Seq[Trail] =
    collection.draft.getOrElse(collection.live)

  override val client: ContentApiClient = DraftContentApi
}
