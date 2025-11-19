package http

import com.gu.pandomainauth.model.User
import play.api.mvc.{RequestHeader, Result}

import scala.concurrent.Future

trait CustomPanDomainAuth {
  def appliesTo(requestHeader: RequestHeader): Boolean

  def authenticateRequest(request: RequestHeader)(produceResultGivenAuthedUser: User => Future[Result]): Future[Result]
}
