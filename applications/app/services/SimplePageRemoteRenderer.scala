package services

import play.api.mvc.Results._
import play.api.mvc.{Action, RequestHeader, Result}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.libs.json.{JsValue, Json, JsObject}
import common.{CanonicalLink, Edition}
import conf.Configuration
import experiments.ActiveExperiments
import model.{ApplicationContext, DotcomContentType, Cached, NoCache, MetaData, SectionId, SimplePage}
import model.dotcomrendering.{Config, DotcomRenderingUtils}
import services.newsletters.model.NewsletterResponse
import services.NewsletterData
import views.support.{CamelCase, JavaScriptPage}

import implicits.Requests._
import renderers.DotcomRenderingService
import scala.concurrent.{ExecutionContext, Future, duration, Await}
import java.util.concurrent.{TimeUnit}
import navigation.Nav
import navigation.ReaderRevenueLinks

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

    val navMenu = Nav.apply(page, edition)

    val navJson = Json.obj(
      "currentUrl" -> navMenu.currentUrl,
      "pillars" -> navMenu.pillars,
      "otherLinks" -> navMenu.otherLinks,
      "brandExtensions" -> navMenu.brandExtensions,
      // "currentNavLinkTitle" -> navMenu.currentNavLink.map(NavLink.id),
      // "currentPillarTitle" -> navMenu.currentPillar.map(NavLink.id),
      // "subNavSections" -> navMenu.subNavSections,
      "readerRevenueLinks" -> ReaderRevenueLinks.all,
    )

    val switches: Map[String, Boolean] = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })

    val config = Config(
      switches = switches,
      abTests = ActiveExperiments.getJsMap(request),
      ampIframeUrl = DotcomRenderingUtils.assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val combinedConfig: JsObject = {
      val jsPageConfig: Map[String, JsValue] =
        JavaScriptPage.getMap(page, Edition(request), isPreview = false, request)
      Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
    }

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
      "config" -> combinedConfig,
      "openGraphData" -> page.getOpenGraphProperties,
      "twitterData" -> page.getTwitterProperties,
      "nav" -> navJson,
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
