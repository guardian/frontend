package controllers

import conf.{CachedHealthCheck, HealthCheckPolicy, HealthCheckPrecondition, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import services.ConfigAgent

class HealthCheck(wsClient: WSClient) extends CachedHealthCheck(
  policy = HealthCheckPolicy.All,
  preconditionMaybe = Some(HealthCheckPrecondition(ConfigAgent.isLoaded, "Facia config has not been loaded yet"))
)(
  NeverExpiresSingleHealthCheck("/uk/business")
)(
  wsClient
)
