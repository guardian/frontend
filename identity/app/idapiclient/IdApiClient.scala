package idapiclient

import common.ExecutionContexts
import conf.IdentityConfiguration

class IdApiClient(http: IdDispatchAsyncHttpClient, jsonParser: IdApiJsonBodyParser, conf: IdentityConfiguration)
  extends IdApi(conf.id.apiRoot, http, jsonParser, new ClientAuth(conf.id.apiClientToken)) with ExecutionContexts
