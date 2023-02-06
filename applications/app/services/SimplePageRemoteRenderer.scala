package services

import play.api.mvc.Results._
import play.api.mvc.{Action, RequestHeader, Result}
import play.api.libs.ws.{WSClient, WSResponse}
import model.{ApplicationContext, Cached, NoCache, SimplePage}
import services.newsletters.model.NewsletterResponse

import implicits.Requests._
import renderers.DotcomRenderingService
import scala.concurrent.{ExecutionContext, Future, duration, Await}
import java.util.concurrent.{TimeUnit}

object SimplePageRemoteRenderer {

  val remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService()

  def renderNewslettersPage(newsletters: List[NewsletterResponse], page: SimplePage, ws: WSClient)(implicit
      request: RequestHeader,
      executionContext: ExecutionContext,
  ): Result = {

    Await.result(
      remoteRenderer.getEmailNewsletters(ws, newsletters, page),
      duration.Duration.create(5, TimeUnit.SECONDS),
    )
  }
}
