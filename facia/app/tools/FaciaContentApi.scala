package tools

import conf.Configuration
import com.gu.openplatform.contentapi.connection.Dispatch
import contentapi.{WsHttp, ContentApiClient}

class AsyncContentApi extends ContentApiClient(Configuration) with WsHttp {
  override val defaultTimeout = 5000
}

//Only use for non blocking
object AsyncContentApi extends AsyncContentApi
