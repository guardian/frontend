package authentication

import play.api.mvc.{Result, Results, Request, ActionBuilder}

import scala.concurrent.Future

trait AuthenticationSupport {

  def validApiKey(apiKey: String): Boolean

  object AuthenticatedAction extends ActionBuilder[Request] with Results {
    override def invokeBlock[A](request: Request[A], block: (Request[A]) => Future[Result]): Future[Result] = {
      request.headers.get("X-Gu-Api-Key") match {
        case Some(apiKey) if validApiKey(apiKey) => block(request)
        case _ => Future.successful(Unauthorized("A valid API key is required."))
      }
    }
  }
}
