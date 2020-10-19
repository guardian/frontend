package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common._
import conf.Configuration
import contentapi.ContentApiClient
import conf.switches.Switches
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.libs.ws.WSClient
import play.api.mvc._
import views.support.{ContentLayout, RenderOtherStatus}
import conf.Configuration.interactive.cdnPath
import model.dotcomrendering.DotcomRenderingTransforms.{designTypeAsString, findPillar, makeMatchUrl}
import model.dotcomrendering.{
  Author,
  DotcomRenderingDataModel,
  PageFooter,
  PageType,
  ReaderRevenueLink,
  ReaderRevenueLinks,
  SubMetaLink,
}
import navigation.{FooterLink, NavLink, Subnav}
import pages.InteractiveHtmlPage
import renderers.DotcomRenderingService

import scala.concurrent.duration._
import scala.concurrent.Future
import services.{CAPILookup, _}
import play.api.libs.json._

case class InteractivePage(interactive: Interactive, related: RelatedContent) extends ContentPage {
  override lazy val item = interactive
}

class InteractiveController(
    contentApiClient: ContentApiClient,
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with RendersItemResponse
    with Logging
    with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  def renderInteractiveJson(path: String): Action[AnyContent] = renderInteractive(path)
  def renderInteractive(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  def proxyInteractiveWebWorker(path: String, file: String): Action[AnyContent] =
    Action.async { implicit request =>
      val timestamp = request.getQueryString("timestamp")
      val serviceWorkerPath = getWebWorkerPath(path, file, timestamp)

      wsClient.url(serviceWorkerPath).get().map { response =>
        Cached(365.days) {
          response.status match {
            case 200 =>
              val contentType = response.headers("Content-Type").mkString(",")
              RevalidatableResult(Ok(response.body).as(contentType), response.body)
            case otherStatus => WithoutRevalidationResult(new Status(otherStatus))
          }
        }
      }
    }

  private def getWebWorkerPath(path: String, file: String, timestamp: Option[String]): String = {
    val stage = if (context.isPreview) "preview" else "live"
    val deployPath = timestamp.map(ts => s"$path/$ts").getOrElse(path)

    s"$cdnPath/service-workers/$stage/$deployPath/$file"
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[InteractivePage, Result]] = {
    val edition = Edition(request)
    log.info(s"Fetching interactive: $path for edition $edition")
    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showFields("all")
        .showAtoms("all"),
    )

    val result = response map { response =>
      val interactive = response.content map { Interactive.make }
      val page = interactive.map(i => InteractivePage(i, StoryPackages(i.metadata.id, response)))

      ModelOrResult(page, response)
    }

    result recover convertApiExceptions
  }

  private def render(model: InteractivePage)(implicit request: RequestHeader) = {
    val htmlResponse = () => InteractiveHtmlPage.html(model)
    val jsonResponse = () => views.html.fragments.interactiveBody(model)
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  override def canRender(i: ItemResponse): Boolean = i.content.exists(_.isInteractive)

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    ApplicationsDotcomRenderingInterface.getRenderingTier(request) match {
      case Legacy => {
        lookup(path) map {
          case Left(model)  => render(model)
          case Right(other) => RenderOtherStatus(other)
        }
      }
      case DotcomRendering => {
        val remoteRenderer = DotcomRenderingService()
        val range = ArticleBlocks
        val dataModel = DotcomRenderingDataModel(
          version = 3,
          headline = "article.trail.headline",
          standfirst = "article.fields.standfirst",
          webTitle = "article.metadata.webTitle",
          mainMediaElements = List(),
          main = "article.fields.main",
          keyEvents = List(),
          blocks = List(),
          pagination = None,
          author = Author(None, None),
          webPublicationDate = "article.trail.webPublicationDate.toString",
          webPublicationDateDisplay = "webPublicationDateDisplay",
          editionLongForm = "Edition(request).displayName",
          editionId = "Edition(request).id",
          pageId = "article.metadata.id",
          tags = List(),
          pillar = "findPillar(article.metadata.pillar, article.metadata.designType)",
          isImmersive = false,
          sectionLabel = "article.content.sectionLabelName",
          sectionUrl = "world/coronavirus-outbreak",
          sectionName = None,
          subMetaSectionLinks = List(),
          subMetaKeywordLinks = List(),
          shouldHideAds = false,
          isAdFreeUser = false,
          webURL = "article.metadata.webUrl",
          linkedData = List(),
          openGraphData = Map(),
          twitterData = Map(),
          config = Json.toJsObject(Map("key" -> "Pascal")),
          guardianBaseURL = "https://www.theguardian.com",
          contentType = "contentType",
          hasRelated = false,
          hasStoryPackage = false,
          beaconURL = "Configuration.debug.beaconUrl",
          isCommentable = false,
          commercialProperties = Map(),
          pageType = PageType(
            hasShowcaseMainElement = false,
            isFront = false,
            isLiveblog = false,
            isMinuteArticle = false,
            isPaidContent = false,
            isPreview = false,
            isSensitive = false,
          ),
          starRating = None,
          trailText = "article.trail.fields.trailText",
          nav = model.dotcomrendering.Nav(
            currentUrl = "currentUrl",
            pillars = List(),
            otherLinks = List(),
            brandExtensions = List(),
            currentNavLink = None,
            currentParent = None,
            currentPillar = None,
            subNavSections = None,
            readerRevenueLinks = ReaderRevenueLinks(
              header = ReaderRevenueLink("", "", ""),
              footer = ReaderRevenueLink("", "", ""),
              sideMenu = ReaderRevenueLink("", "", ""),
              ampHeader = ReaderRevenueLink("", "", ""),
              ampFooter = ReaderRevenueLink("", "", ""),
            ),
          ),
          showBottomSocialButtons = false,
          designType = "designTypeAsString(article.metadata.designType)",
          pageFooter = PageFooter(
            footerLinks = List(),
          ),
          publication = "article.content.publication",
          shouldHideReaderRevenue = false,
          slotMachineFlags = "request.slotMachineFlags",
          contributionsServiceUrl = "https://contributions.guardianapis.com",
          badge = None,
          matchUrl = None,
        )
        remoteRenderer.getAMPArticleExperimental(wsClient, dataModel)
        // val html: String = ApplicationsDotcomRenderingInterface.getHtmlFromDCR()
        // Future.successful(Ok(html))
      }
    }
  }
}
