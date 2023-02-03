package services

import play.api.mvc.Results._
import play.api.mvc.{Action, RequestHeader, Result}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.libs.json.{JsValue, Json, JsObject}
import model.{ApplicationContext, DotcomContentType, Cached, NoCache, MetaData, SectionId, SimplePage}
import common.{CanonicalLink, Edition}
import conf.Configuration
import services.newsletters.model.NewsletterResponse
import services.NewsletterData

import implicits.Requests._
import renderers.DotcomRenderingService
import scala.concurrent.{ExecutionContext, Future, duration, Await}
import java.util.concurrent.{TimeUnit}

object SimplePageRemoteRenderer {

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

  private def buildJson(newsletters: List[NewsletterResponse], page: SimplePage)(implicit
      request: RequestHeader,
  ): String = {

    val newsletterData = newsletters
      .filter((newsletter) => newsletter.cancelled == false && newsletter.paused == false)
      .map((newsletter) => convertNewsletterResponseToData(newsletter))

    val edition = Edition(request)

    val json = Json.obj(
      "newsletters" -> newsletterData,
      "id" -> page.metadata.id,
      "editionId" -> edition.id,
      "editionLongForm" -> Edition(request).displayName,
      "beaconURL" -> Configuration.debug.beaconUrl,
      "subscribeUrl" -> Configuration.id.subscribeUrl,
      "contributionsServiceUrl" -> Configuration.contributionsService.url,
      "webTitle" -> page.metadata.webTitle,
      "description" -> page.metadata.description,
      "config" -> page.getJavascriptConfig,
      "openGraphData" -> page.getOpenGraphProperties,
      "twitterData" -> page.getTwitterProperties,
    )
    json.toString()
  }

  def newslettersPage(newsletters: List[NewsletterResponse], page: SimplePage, ws: WSClient)(implicit
      request: RequestHeader,
      executionContext: ExecutionContext,
  ): Result = {

    Await.result(
      remoteRenderer.getEmailNewsletters(ws, buildJson(newsletters, page)),
      duration.Duration.create(5, TimeUnit.SECONDS),
    )
  }
}
