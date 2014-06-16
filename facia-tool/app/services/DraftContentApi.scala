package services

import contentapi.ElasticSearchLiveContentApiClient
import conf.Configuration

class ElasticSearchDraftContentApiClient extends ElasticSearchLiveContentApiClient {
  override val targetUrl = Configuration.contentApi.contentApiDraftHost
}

object DraftContentApi extends ElasticSearchDraftContentApiClient()
