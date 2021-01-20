package controllers

import conf.{CachedHealthCheck, HealthCheckPolicy, HealthCheckPrecondition, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.ConfigAgent

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents)
    extends CachedHealthCheck(
      policy = HealthCheckPolicy.All,
      preconditionMaybe = Some(HealthCheckPrecondition(ConfigAgent.isLoaded _, "Facia config has not been loaded yet")),
    )(
      NeverExpiresSingleHealthCheck("/uk/business"),
    )(
      wsClient,
    )
