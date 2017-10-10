package idapiclient


import conf.IdentityConfiguration
import idapiclient.parser.IdApiJsonBodyParser
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext

class IdApiClient(
    jsonParser: IdApiJsonBodyParser,
    conf: IdentityConfiguration,
    wsClient: WSClient)
    (implicit val executionContext: ExecutionContext)
  extends IdApi(jsonParser, conf, wsClient)
