package idapiclient

import com.google.inject.Inject
import common.ExecutionContexts
import conf.IdentityConfiguration

class IdApiClient @Inject()(http: IdDispatchAsyncHttpClient, jsonParser: IdApiJsonBodyParser, conf: IdentityConfiguration)
  extends IdApi(conf.id.apiRoot, http, jsonParser, new ClientAuth(conf.id.apiClientToken)) with ExecutionContexts
