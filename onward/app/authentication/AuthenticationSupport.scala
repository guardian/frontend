package authentication

import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

trait AuthenticationSupport {

  def validApiKey(apiKey: String): Boolean

  class AuthenticatedAction[C](val parser: BodyParser[C], val executionContext: ExecutionContext)
      extends ActionBuilder[Request, C]
      with Results {
    override def invokeBlock[A](request: Request[A], block: (Request[A]) => Future[Result]): Future[Result] = {
      request.headers.get("X-Gu-Api-Key") match {
        case Some(apiKey) if validApiKey(apiKey) => block(request)
        case _                                   => Future.successful(Unauthorized("A valid API key is required."))
      }
    }
  }
}
