package idapiclient

import com.google.inject.Inject
import common.ExecutionContexts

class IdApiClient @Inject()(http: IdDispatchAsyncHttpClient, jsonParser: IdApiJsonBodyParser)
  extends IdApi("http://example.com", http, jsonParser) with ExecutionContexts
