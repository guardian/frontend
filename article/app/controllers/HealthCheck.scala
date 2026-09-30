package controllers

import conf.{CachedHealthCheck, HealthCheckPolicy, HealthCheckPrecondition, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents
import services.ArticleAbTestAgent


class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents, articleAbTestAgent: ArticleAbTestAgent)
  extends CachedHealthCheck(
    policy = HealthCheckPolicy.All,
    preconditionMaybe = Some(HealthCheckPrecondition(articleAbTestAgent.isLoaded _, "Active article A/B test cache has not been loaded yet")),
  )(
    NeverExpiresSingleHealthCheck("/football/2015/jul/23/barcelona-fined-uefa-pro-catalan-banners-champions-league"),
  )(
    wsClient)
