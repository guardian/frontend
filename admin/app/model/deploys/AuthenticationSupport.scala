package model.deploys

import play.api.mvc.{ActionBuilder, Request, Result, Results}

import scala.concurrent.Future

trait ApiKeyAuthenticationSupport {

  def validApiKey(apiKey: String): Boolean

  object ApiKeyAuthenticatedAction extends ActionBuilder[Request] with Results {
    override def invokeBlock[A](request: Request[A], block: (Request[A]) => Future[Result]): Future[Result] = {
      request.headers.get("X-Gu-Api-Key") match { // Try in request headers first
        case Some(apiKey) if validApiKey(apiKey) => block(request)
        case _ =>
          request.queryString.get("api-key").map(_.head) match { // Try in query string then
            case Some(apiKey) if validApiKey(apiKey) => block(request)
            case _ => Future.successful(Unauthorized("Invalid API key"))
          }
      }
    }
  }
}
