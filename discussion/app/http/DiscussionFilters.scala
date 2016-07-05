package http

import conf._
import filters.RequestLoggingFilter
import play.api.http.HttpFilters
import play.api.mvc.EssentialFilter

class DiscussionFilters extends HttpFilters {
  // NOTE - order is important here, Gzipper AFTER CorsVaryHeaders
  // which effectively means "JsonVaryHeaders goes around Gzipper"
  lazy val filters: List[EssentialFilter] = List(
    new RequestLoggingFilter,
    new PanicSheddingFilter,
    new JsonVaryHeadersFilter,
    new Gzipper,
    new BackendHeaderFilter,
    new SurrogateKeyFilter,
    new AmpFilter
  )
}
