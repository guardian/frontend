package idapiclient

import com.google.inject.Inject
import common.ExecutionContexts
import conf.IdentityConfiguration
import utils.SafeLogging

class IdApiClient @Inject()(http: IdDispatchAsyncHttpClient, jsonParser: IdApiJsonBodyParser, conf: IdentityConfiguration)
  extends IdApi(conf.id.apiRoot, http, jsonParser) with ExecutionContexts {

  override val logger = SafeLogging.logger
}
