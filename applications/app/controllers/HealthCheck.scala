package controllers

import conf.{CachedHealthCheck, HealthCheckPolicy, HealthCheckPrecondition, NeverExpiresSingleHealthCheck}
import contentapi.SectionsLookUp
import play.api.libs.ws.WSClient

class HealthCheck(wsClient: WSClient, sectionsLookUp: SectionsLookUp) extends CachedHealthCheck(
  policy = HealthCheckPolicy.All,
  preconditionMaybe = Some(HealthCheckPrecondition(sectionsLookUp.isLoaded, "Sections lookup service has not been loaded yet"))
)(
  NeverExpiresSingleHealthCheck("/books"),
  NeverExpiresSingleHealthCheck("/books/harrypotter"),
  NeverExpiresSingleHealthCheck("/news/gallery/2012/oct/02/24-hours-in-pictures"),
  NeverExpiresSingleHealthCheck("/news/gallery/2012/oct/02/24-hours-in-pictures?index=2"),
  NeverExpiresSingleHealthCheck("/world/video/2012/dec/31/52-weeks-photos-2012-video")
)(
  wsClient
)
