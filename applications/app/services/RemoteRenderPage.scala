package services

import play.api.mvc.Results._
import play.api.mvc.{Action, RequestHeader, Result}
import play.api.libs.ws.{WSClient, WSResponse}
import model.{ApplicationContext, Cached, NoCache}
import services.newsletters.model.NewsletterResponse

import implicits.Requests._
import renderers.DotcomRenderingService
import scala.concurrent.{ExecutionContext, Future, duration, Await}

object RemoteRenderPage {

  val remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService()

  private def newslettersToJson(newsletters: List[NewsletterResponse]):String = {
    val count = newsletters.count(n=>true);
    val json = s"{\"count\": ${count}, \"testValue\": \"fooBar\"}"

    json
  }

  def newslettersPage(newsletters: List[NewsletterResponse], ws: WSClient)(implicit
      request: RequestHeader,
      executionContext: ExecutionContext,
  ): Result = {

    Await.result(
      remoteRenderer.getEmailNewsletters(ws, newslettersToJson(newsletters)),
      duration.Duration.Inf,
    )
  }
}
