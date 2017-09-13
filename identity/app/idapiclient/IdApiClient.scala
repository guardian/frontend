package idapiclient


import conf.IdentityConfiguration

import scala.concurrent.ExecutionContext

class IdApiClient(http: IdDispatchAsyncHttpClient, jsonParser: IdApiJsonBodyParser, conf: IdentityConfiguration)(implicit val executionContext: ExecutionContext)
  extends IdApi(http, jsonParser, conf)
