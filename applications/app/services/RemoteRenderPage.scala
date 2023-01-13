package services

import play.api.mvc.Results._
import play.api.mvc.{Action, RequestHeader, Result}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.libs.json.{JsValue, Json, JsObject}
import model.{ApplicationContext, DotcomContentType, Cached, NoCache, MetaData, SectionId}
import services.newsletters.model.NewsletterResponse
import services.NewsletterData

import implicits.Requests._
import renderers.DotcomRenderingService
import scala.concurrent.{ExecutionContext, Future, duration, Await}
import java.util.concurrent.{TimeUnit}

object RemoteRenderPage {

  val remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService()

  // TO DO - wire the newsletterService and use the method from there
  private def convertNewsletterResponseToData(response: NewsletterResponse): NewsletterData = {
    NewsletterData(
      response.identityName,
      response.name,
      response.theme,
      response.description,
      response.frequency,
      response.listId,
      response.group,
      response.emailEmbed.successDescription,
      response.regionFocus,
    )
  }

  private def newslettersToJson(newsletters: List[NewsletterResponse])(implicit
      request: RequestHeader
  ): String = {
    val newsletterData = newsletters
      .filter((newsletter) => newsletter.cancelled == false && newsletter.paused == false)
      .map((newsletter) => convertNewsletterResponseToData(newsletter))

    val metaData = MetaData.make(
      id = request.path,
      section = Option(SectionId(value = "newsletter-signup-page")),
      webTitle = "Guardian newsletters: Sign up for our free newsletters",
      description = Some(
        "Scroll less and understand more about the subjects you care about with the Guardian's brilliant email newsletters, free to your inbox.",
      ),
      contentType = Some(DotcomContentType.Signup),
      iosType = None,
      shouldGoogleIndex = true,
    )

    val json = Json.obj(
      "newsletters" -> newsletterData,
      "id" -> metaData.id,
      "webUrl" -> metaData.webUrl,
      "webTitle" -> metaData.webTitle,
      "canonicalUrl" -> metaData.canonicalUrl,
      "section" -> metaData.section,
      "description" -> metaData.description,
    )
    json.toString()
  }

  def newslettersPage(newsletters: List[NewsletterResponse], ws: WSClient)(implicit
      request: RequestHeader,
      executionContext: ExecutionContext,
  ): Result = {

    Await.result(
      remoteRenderer.getEmailNewsletters(ws, newslettersToJson(newsletters)),
      duration.Duration.create(5, TimeUnit.SECONDS),
    )
  }
}
