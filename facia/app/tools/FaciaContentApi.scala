package tools

import conf.Configuration
import com.gu.openplatform.contentapi.connection.Dispatch
import contentapi.{WsHttp, ContentApiClient}

class FaciaContentApi extends ContentApiClient(Configuration) with WsHttp {
  override val defaultTimeout = 5000
}

object FaciaContentApi extends FaciaContentApi
