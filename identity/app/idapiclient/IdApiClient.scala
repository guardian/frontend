package idapiclient


import conf.IdentityConfiguration
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext

class IdApiClient(
    http: IdDispatchAsyncHttpClient,
    jsonParser: IdApiJsonBodyParser,
    conf: IdentityConfiguration,
    wsClient: WSClient)
    (implicit val executionContext: ExecutionContext)
  extends IdApi(http, jsonParser, conf, wsClient)
