package commercial.controllers

import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.mvc._
import play.twirl.api.Html
import play.api.libs.ws.WSClient

import scala.concurrent.Future
import scala.util.control.NonFatal
import com.gu.contentapi.client.model.ContentApiError
import com.gu.contentapi.client.model.ItemQuery
import com.gu.contentapi.client.model.v1.ContentType.{Gallery, Video}
import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse}
import commercial.model.hosted.HostedTrails
import common.`package`.convertApiExceptionsWithoutEither
import common.commercial.hosted._
import common.{Edition, GuLogging, ImplicitControllerExecutionContext, JsonComponent, JsonNotFound, ModelOrResult}
import contentapi.ContentApiClient
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{
  ApplicationContext,
  Article,
  ArticleBlocks,
  ArticlePage,
  Cached,
  Content,
  NoCache,
  PageWithStoryPackage,
  StoryPackages,
}
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import model.hosted.{HostedOnwardTrails, HostedTrail}
import model.meta.BlocksOn
import renderers.DotcomRenderingService
import services.CAPILookup
import services.dotcomrendering.{HostedContentPicker, LocalRender, RemoteRender}
import views.html.commercialExpired
import views.html.hosted._
import views.support.RenderOtherStatus

class HostedContentController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    wsClient: WSClient,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging
    with implicits.Requests {

  private def cacheDuration: Int = 60
  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  /** Render locally (in frontend) using Twirl templates */
  private def localRender(
      hostedPage: Future[Option[HostedPage]],
  )(implicit request: Request[AnyContent]): Future[Result] = {
    def cached(html: Html) = Cached(cacheDuration)(RevalidatableResult.Ok(html))
    hostedPage map {
      case Some(page: HostedVideoPage) =>
        cached {
          if (request.isAmp) guardianAmpHostedVideo(page)
          else guardianHostedVideo(page)
        }
      case Some(page: HostedGalleryPage) =>
        cached {
          if (request.isAmp) guardianAmpHostedGallery(page)
          else guardianHostedGallery(page)
        }
      case Some(page: HostedArticlePage) =>
        cached {
          if (request.isAmp) guardianAmpHostedArticle(page)
          else guardianHostedArticle(page)
        }
      case _ => NoCache(NotFound)
    } recover {
      case e: ContentApiError if e.httpStatus == 410 =>
        cached(commercialExpired(wasAHostedPage = true))
      case e: ContentApiError if e.httpStatus == 404 =>
        Cached(cacheDuration)(WithoutRevalidationResult(NotFound))
    }
  }

  /** Legacy CAPI lookup query */
  private def baseQuery(itemId: String)(implicit request: Request[AnyContent]): ItemQuery =
    contentApiClient
      .item(itemId, Edition(request))
      .showSection(true)
      .showElements("all")
      .showFields("all")
      .showTags("all")
      .showAtoms("all")

  private def lookup(
      campaignName: String,
      pageName: String,
  )(implicit request: Request[AnyContent]): Future[ItemResponse] = {
    val itemId = s"advertiser-content/$campaignName/$pageName"
    capiLookup.lookup(itemId, Some(ArticleBlocks))
  }

  private def handleCapiResponse(
      response: ItemResponse,
  )(implicit request: RequestHeader): Either[Result, BlocksOn[ArticlePage]] = {
    val content = response.content.map(Content(_))
    val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())
    ModelOrResult(content, response) match {
      case Right(article: Article) =>
        Right(BlocksOn(ArticlePage(article, StoryPackages(article.metadata.id, response)), blocks))
      case Left(r) => Left(r)
      case _       => Left(NotFound)
    }
  }

  def renderHostedPage(campaignName: String, pageName: String): Action[AnyContent] =
    Action.async { implicit request =>
      lookup(campaignName, pageName) flatMap { response =>
        val tier = HostedContentPicker.getTier()
        tier match {
          // DCR pages
          case RemoteRender =>
            handleCapiResponse(response) match {
              case Right(articleBlocks) if request.isJson && request.forceDCR =>
                Future.successful(
                  common.renderJson(getDCRJson(articleBlocks), articleBlocks.page).as("application/json"),
                )
              case Right(articleBlocks) =>
                remoteRender(articleBlocks)
              case Left(other) => Future.successful(RenderOtherStatus(other))
            }
          // Frontend rendered pages
          case LocalRender =>
            response.content match {
              case Some(content) =>
                localRender(Future.successful(HostedPage.fromContent(content)))
              case None =>
                Future.successful(NotFound)
            }
        }
      } recover convertApiExceptionsWithoutEither
    }

  /** Render JSON response sent to dotcom-rendering */
  private def getDCRJson(
      pageBlocks: BlocksOn[ArticlePage],
  )(implicit request: RequestHeader): JsValue = {
    val pageType: PageType = PageType(pageBlocks.page, request, context)
    DotcomRenderingDataModel.toJson(DotcomRenderingDataModel.forArticle(pageBlocks, request, pageType, None))
  }

  /** Render via dotcom-rendering */
  private def remoteRender(
      pageBlocks: BlocksOn[PageWithStoryPackage],
  )(implicit request: RequestHeader): Future[Result] = {
    val pageType = PageType(pageBlocks.page, request, context)

    if (request.isApps) {
      remoteRenderer.getAppsHostedArticle(wsClient, pageBlocks, pageType)
    } else {
      remoteRenderer.getHostedArticle(wsClient, pageBlocks, pageType)
    }
  }

  private def fetchOnwardTrails(itemId: String, sectionId: String, limit: Int = 3)(implicit
      request: RequestHeader,
  ): Future[Seq[HostedTrail]] = {
    capiLookup.lookup(sectionId, None) map { response =>
      response.results match {
        case Some(results) =>
          HostedOnwardTrails.fromContent(itemId, results.toSeq).take(limit) flatMap { trail =>
            HostedOnwardTrails.toHostedTrail(trail)
          }
        case None => Seq.empty
      }
    }
  }

  def renderOnwardJson(campaignName: String, pageName: String): Action[AnyContent] =
    Action.async { implicit request =>
      val itemId = s"advertiser-content/$campaignName/$pageName"
      val sectionId = s"advertiser-content/$campaignName"

      fetchOnwardTrails(itemId, sectionId) map { trails =>
        Cached(cacheDuration)(
          JsonComponent.fromWritable(HostedOnwardTrails(trails)),
        )
      } recover { case NonFatal(e) =>
        log.warn(s"Capi lookup of item '$sectionId' failed: ${e.getMessage}", e)
        Cached(0)(JsonNotFound())
      }
    }

  /** Legacy method of rendering onward journey data */
  def renderOnwardComponent(campaignName: String, pageName: String, contentType: String): Action[AnyContent] =
    Action.async { implicit request =>
      def onwardView(trails: Seq[HostedPage], defaultRowCount: Int, maxRowCount: Int): RevalidatableResult = {
        if (request.isAmp) {
          def toJson(trail: HostedPage) =
            Json.obj(
              "title" -> trail.title,
              "url" -> trail.url,
              "imageUrl" -> trail.thumbnailUrl,
            )
          JsonComponent {
            "items" -> JsArray(
              Seq(
                Json.obj(
                  "owner" -> trails.headOption.map(_.owner),
                  "trails" -> JsArray(trails.take(defaultRowCount).map(toJson)),
                ),
              ),
            )
          }
        } else {
          JsonComponent(hostedOnwardJourney(trails, maxRowCount))
        }
      }

      def galleryOnwardView(trails: Seq[HostedPage]): RevalidatableResult = {
        if (request.isAmp) {
          def toJson(trail: HostedPage) =
            Json.obj(
              "url" -> trail.url,
              "imageUrl" -> trail.thumbnailUrl,
            )
          JsonComponent {
            val cta = trails.headOption.map(_.cta)
            "items" -> JsArray(
              Seq(
                Json.obj(
                  "ctaText" -> cta.map(_.label),
                  "ctaLink" -> cta.map(_.url),
                  "buttonText" -> cta.map(_.btnText),
                  "trails" -> JsArray(trails.map(toJson)),
                ),
              ),
            )
          }
        } else {
          JsonComponent(hostedGalleryOnward(trails))
        }
      }

      val capiResponse = {
        val sectionId = s"advertiser-content/$campaignName"
        val query = baseQuery(sectionId)
          .pageSize(100)
          .orderBy("oldest")
        val response = contentApiClient.getResponse(query)
        response.failed.foreach { case NonFatal(e) =>
          log.warn(s"Capi lookup of item '$sectionId' failed: ${e.getMessage}", e)
        }
        response
      }

      capiResponse map { response =>
        response.results map { results =>
          val itemId = s"advertiser-content/$campaignName/$pageName"
          contentType match {
            case "video" =>
              val trails = HostedTrails.fromContent(itemId, results.toSeq)
              Cached(cacheDuration)(onwardView(trails, 1, 1))
            case "article" =>
              val trails = HostedTrails.fromContent(itemId, results.toSeq)
              Cached(cacheDuration)(onwardView(trails, 2, 4))
            case "gallery" =>
              val trails = HostedTrails.fromContent(itemId, trailCount = 2, results.toSeq)
              Cached(cacheDuration)(galleryOnwardView(trails))
            case _ =>
              Cached(0)(JsonNotFound())
          }
        } getOrElse {
          Cached(0)(JsonNotFound())
        }
      }
    }

  /** Legacy method to render onward content for video pages */
  def renderAutoplayComponent(campaignName: String, pageName: String): Action[AnyContent] =
    Action.async { implicit request =>
      val capiResponse = {
        val sectionId = s"advertiser-content/$campaignName"
        val query = baseQuery(sectionId)
          .pageSize(100)
          .orderBy("oldest")
        val response = contentApiClient.getResponse(query)
        response.failed.foreach { case NonFatal(e) =>
          log.warn(s"Capi lookup of item '$sectionId' failed: ${e.getMessage}", e)
        }
        response
      }

      capiResponse map { response =>
        response.results map { results =>
          val videoPages = results
            .filter(_.`type` == Video)
          val itemId = s"advertiser-content/$campaignName/$pageName"
          val trails = HostedTrails.fromContent(itemId, 1, videoPages.toSeq)
          Cached(cacheDuration)(JsonComponent(hostedVideoAutoplayWrapper(trails)))
        } getOrElse {
          Cached(0)(JsonNotFound())
        }
      }
    }
}
