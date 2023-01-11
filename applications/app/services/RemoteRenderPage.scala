package services

import play.api.mvc.Results._
import play.api.mvc.{Action, RequestHeader, Result}
import play.api.libs.ws.{WSClient, WSResponse}
import model.{ApplicationContext, Cached, NoCache}
import services.newsletters.model.NewsletterResponse

import implicits.Requests._
import renderers.DotcomRenderingService

object RemoteRenderPage {

  val remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService()

  def newslettersPage(newsletters: List[NewsletterResponse], ws: WSClient)(implicit
      request: RequestHeader,
  ): Result = {

    NoCache(InternalServerError(newsletters.toString()))
  }
}
