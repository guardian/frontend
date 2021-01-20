package discussion.api

import model.{CacheTime, Cached}
import model.Cached.WithoutRevalidationResult
import play.api.mvc.{RequestHeader, Result}
import play.api.mvc.Results.{InternalServerError, NotFound}

sealed abstract class DiscussionApiException(msg: String) extends RuntimeException(msg)
case class NotFoundException(msg: String) extends DiscussionApiException(msg)
case class OtherException(msg: String) extends DiscussionApiException(msg)
case class ServiceUnavailableException(msg: String) extends DiscussionApiException(msg)

object DiscussionApiException {

  def toResult(implicit request: RequestHeader): PartialFunction[Throwable, Result] = {
    case NotFoundException(msg) => Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound(msg)))
    case OtherException(msg)    => InternalServerError(msg)
  }
}
