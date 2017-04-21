package idapiclient

import common.ExecutionContexts
import conf.IdConfig

class IdApiClient(http: IdDispatchAsyncHttpClient, jsonParser: IdApiJsonBodyParser, conf: IdConfig)
  extends IdApi(http, jsonParser, conf) with ExecutionContexts
