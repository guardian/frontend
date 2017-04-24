package idapiclient

import common.ExecutionContexts
import conf.IdentityConfiguration

class IdApiClient(http: IdDispatchAsyncHttpClient, jsonParser: IdApiJsonBodyParser, conf: IdentityConfiguration)
  extends IdApi(http, jsonParser, conf) with ExecutionContexts
