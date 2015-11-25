package frontpress

import conf.Configuration
import contentapi.LiveContentApiClient

object DraftContentApi extends LiveContentApiClient {
  override val targetUrl = Configuration.contentApi.contentApiDraftHost
}
