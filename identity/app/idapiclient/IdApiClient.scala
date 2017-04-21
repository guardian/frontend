package idapiclient

import common.ExecutionContexts
import conf.IdentityConfiguration

class IdApiClient(http: IdDispatchAsyncHttpClient, jsonParser: IdApiJsonBodyParser, apiRoot: String, apiClientToken: String, accDeletionApiRoot: String, accDeletionApiKey: String)
  extends IdApi(http, jsonParser, apiRoot, apiClientToken, accDeletionApiRoot, accDeletionApiKey) with ExecutionContexts
