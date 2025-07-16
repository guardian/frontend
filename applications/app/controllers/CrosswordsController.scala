package controllers

import com.gu.contentapi.client.model.v1.{
  Crossword,
  ItemResponse,
  SearchResponse,
  Content => ApiContent,
  Section => ApiSection,
}
import common.{Edition, GuLogging, ImplicitControllerExecutionContext}
import conf.Static
import contentapi.ContentApiClient
import com.gu.contentapi.client.model.{ContentApiError, SearchQuery}
import crosswords.{
  AccessibleCrosswordPage,
  AccessibleCrosswordRows,
  CrosswordPageWithContent,
  CrosswordPageWithSvg,
  CrosswordSearchPageNoResult,
  CrosswordSearchPageWithResults,
  CrosswordSvg,
}
import html.HtmlPageHelpers.ContentCSSFile
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import model.dotcomrendering.pageElements.EditionsCrosswordRenderingDataModel
import model.dotcomrendering.pageElements.EditionsCrosswordRenderingDataModel.toJson
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import org.joda.time.{DateTime, LocalDate}
import pages.{CrosswordHtmlPage, IndexHtmlPage, PrintableCrosswordHtmlPage}
import play.api.data.Forms._
import play.api.data._
import play.api.libs.json.JsValue
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.dotcomrendering.{CrosswordsPicker, RemoteRender}
import services.{IndexPage, IndexPageItem}

import scala.collection.immutable
import scala.concurrent.Future
import scala.concurrent.duration._

trait CrosswordController extends BaseController with GuLogging with ImplicitControllerExecutionContext {

  def contentApiClient: ContentApiClient

  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()
  val wsClient: WSClient

  def noResults()(implicit request: RequestHeader): Result

  def getCrossword(crosswordType: String, id: Int)(implicit request: RequestHeader): Future[ItemResponse] = {
    contentApiClient.getResponse(
      contentApiClient.item(s"crosswords/$crosswordType/$id", Edition(request)).showFields("all"),
    )
  }

  def withCrossword(crosswordType: String, id: Int)(
      f: (Crossword, ApiContent) => Future[Result],
  )(implicit request: RequestHeader): Future[Result] = {
    getCrossword(crosswordType, id).flatMap { response =>
      val maybeCrossword = for {
        content <- response.content
        crossword <- content.crossword
      } yield f(crossword, content)
      maybeCrossword getOrElse Future.successful(noResults())
    } recover {
      case capiError: ContentApiError if capiError.httpStatus == 404 => {
        logInfoWithRequestId(s"The $crosswordType crossword with id $id was not found in CAPI")
        noResults()
      }
      case t: Throwable => {
        logErrorWithRequestId(s"Error retrieving $crosswordType crossword id $id from API", t)
        noResults()
      }
    }
  }

  def renderCrosswordPage(crosswordType: String, id: Int)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Future[Result] = {
    withCrossword(crosswordType, id) { (crossword, content) =>
      val page = CrosswordPageWithSvg(
        CrosswordContent.make(CrosswordData.fromCrossword(crossword, content), content),
        CrosswordSvg(crossword, None, None, false),
      )

      if (CrosswordsPicker.getTier(page) == RemoteRender)
        remoteRenderer.getCrossword(wsClient, page, PageType(page, request, context))
      else
        Future.successful(
          Cached(CacheTime.Crosswords)(
            RevalidatableResult.Ok(
              CrosswordHtmlPage.html(page),
            ),
          ),
        )
    }
  }
}

class CrosswordPageController(
    val contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    val wsClient: WSClient,
)(implicit
    context: ApplicationContext,
) extends CrosswordController {

  def noResults()(implicit request: RequestHeader): Result =
    Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))

  def crossword(crosswordType: String, id: Int): Action[AnyContent] =
    Action.async { implicit request =>
      renderCrosswordPage(crosswordType, id)
    }

  def renderJson(crosswordType: String, id: Int): Action[AnyContent] = {
    Action.async { implicit request =>
      withCrossword(crosswordType, id) { (crossword, content) =>
        val crosswordContent = CrosswordContent.make(CrosswordData.fromCrossword(crossword, content), content)
        val crosswordPage = new CrosswordPageWithContent(crosswordContent)

        val pageType = PageType(crosswordPage, request, context)
        Future.successful(
          common.renderJson(getDCRJson(crosswordPage, pageType), crosswordPage).as("application/json"),
        )
      }
    }
  }
  private def getDCRJson(crosswordPage: CrosswordPageWithContent, pageType: PageType)(implicit
      request: RequestHeader,
  ): JsValue =
    DotcomRenderingDataModel.toJson(
      DotcomRenderingDataModel.forCrossword(crosswordPage, request, pageType),
    )

  def accessibleCrossword(crosswordType: String, id: Int): Action[AnyContent] =
    Action.async { implicit request =>
      withCrossword(crosswordType, id) { (crossword, content) =>
        val retitledFields = for {
          fields <- content.fields
          headline <- fields.headline
        } yield fields.copy(headline = Some(s"Accessible version of $headline"))

        val retitledContent = content.copy(
          fields = retitledFields,
          webTitle = s"Accessible version of ${content.webTitle}",
        )
        Future.successful(
          Cached(60.seconds)(
            RevalidatableResult.Ok(
              CrosswordHtmlPage.html(
                AccessibleCrosswordPage(
                  CrosswordContent.make(
                    CrosswordData.fromCrossword(crossword, retitledContent),
                    retitledContent,
                  ),
                  AccessibleCrosswordRows(crossword),
                ),
              ),
            ),
          ),
        )
      }
    }

  def printableCrossword(crosswordType: String, id: Int): Action[AnyContent] =
    Action.async { implicit request =>
      withCrossword(crosswordType, id) { (crossword, content) =>
        Future.successful(
          Cached(60.seconds)(
            RevalidatableResult.Ok(
              PrintableCrosswordHtmlPage.html(
                CrosswordPageWithSvg(
                  CrosswordContent.make(CrosswordData.fromCrossword(crossword, content), content),
                  CrosswordSvg(crossword, None, None, false),
                ),
              ),
            ),
          ),
        )
      }
    }

  def thumbnail(crosswordType: String, id: Int): Action[AnyContent] =
    Action.async { implicit request =>
      withCrossword(crosswordType, id) { (crossword, _) =>
        val xml = CrosswordSvg(crossword, Some("100%"), Some("100%"), trim = true)

        val globalStylesheet = Static(s"stylesheets/$ContentCSSFile.css")

        Future.successful(
          Cached(60.seconds) {
            val body = s"""$xml"""
            RevalidatableResult(
              Cors {
                Ok(body).as("image/svg+xml")
              },
              body,
            )
          },
        )
      }
    }
}

class CrosswordSearchController(
    val contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    val wsClient: WSClient,
)(implicit context: ApplicationContext)
    extends CrosswordController {
  val searchForm = Form(
    mapping(
      "crossword_type" -> nonEmptyText,
      "month" -> number,
      "year" -> number,
      "setter" -> optional(text),
    )(CrosswordSearch.apply)(CrosswordSearch.unapply),
  )

  val lookupForm = Form(
    mapping(
      "crossword_type" -> nonEmptyText,
      "id" -> number,
    )(CrosswordLookup.apply)(CrosswordLookup.unapply),
  )

  def noResults()(implicit request: RequestHeader): Result =
    Cached(7.days)(
      RevalidatableResult.Ok(
        CrosswordHtmlPage.html(new CrosswordSearchPageNoResult),
      ),
    )

  def search(): Action[AnyContent] =
    Action.async { implicit request =>
      searchForm
        .bindFromRequest()
        .fold(
          empty =>
            Future.successful(
              Cached(7.days)(
                RevalidatableResult.Ok(
                  CrosswordHtmlPage.html(new CrosswordSearchPageWithResults),
                ),
              ),
            ),
          params => {
            val withoutSetter = contentApiClient
              .item(s"crosswords/series/${params.crosswordType}")
              .stringParam("from-date", params.fromDate.toString("yyyy-MM-dd"))
              .stringParam("to-date", params.toDate.toString("yyyy-MM-dd"))
              .pageSize(50)

            val maybeSetter = params.setter.fold(withoutSetter) { setter =>
              withoutSetter.stringParam("tag", s"profile/${setter.toLowerCase}")
            }

            contentApiClient.getResponse(maybeSetter.showFields("all")).map { response =>
              response.results.getOrElse(Seq.empty).toList match {
                case Nil => noResults()

                case results =>
                  val section = Section.make(
                    ApiSection(
                      "crosswords",
                      "Crosswords search results",
                      "http://www.theguardian.com/crosswords/search",
                      "",
                      Nil,
                    ),
                  )
                  val page = IndexPage(
                    page = section,
                    contents = results.map(IndexPageItem(_)),
                    tags = Tags(Nil),
                    date = DateTime.now,
                    tzOverride = None,
                  )

                  Cached(15.minutes)(RevalidatableResult.Ok(IndexHtmlPage.html(page)))
              }
            }
          },
        )
    }

  def lookup(): Action[AnyContent] =
    Action.async { implicit request =>
      lookupForm
        .bindFromRequest()
        .fold(
          formWithErrors => Future.successful(noResults()),
          lookUpData => renderCrosswordPage(lookUpData.crosswordType, lookUpData.id),
        )
    }

  case class CrosswordSearch(crosswordType: String, month: Int, year: Int, setter: Option[String]) {
    val fromDate = new LocalDate(year, month, 1)
    val toDate = fromDate.dayOfMonth.withMaximumValue.minusDays(1)
  }

  case class CrosswordLookup(crosswordType: String, id: Int)
}

class CrosswordEditionsController(
    val contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    val remoteRenderer: DotcomRenderingService = DotcomRenderingService(),
    val wsClient: WSClient,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def digitalEdition: Action[AnyContent] = Action.async { implicit request =>
    getCrosswords
      .map(parseCrosswords)
      .flatMap { crosswords =>
        remoteRenderer.getEditionsCrossword(wsClient, crosswords)
      }
  }

  def digitalEditionJson: Action[AnyContent] = Action.async { implicit request =>
    getCrosswords
      .map(parseCrosswords)
      .map { crosswords =>
        Cached(CacheTime.Default)(RevalidatableResult.Ok(toJson(crosswords))).as("application/json")
      }
  }

  private def getCrosswords: Future[SearchResponse] =
    contentApiClient.getResponse(crosswordsQuery)

  /** Search for playable crosswords sorted by print publication date. This will exclude older, originally print-only
    * crosswords that happen to have been re-published in a digital format recently.
    */
  private lazy val crosswordsQuery =
    SearchQuery()
      .contentType("crossword")
      .tag(crosswordTags)
      .useDate("newspaper-edition")
      .pageSize(75)

  private lazy val crosswordTags = Seq(
    "crosswords/series/quick",
    "crosswords/series/cryptic",
    "crosswords/series/prize",
    "crosswords/series/weekend-crossword",
    "crosswords/series/sunday-quick",
    "crosswords/series/quick-cryptic",
    "crosswords/series/everyman",
    "crosswords/series/speedy",
    "crosswords/series/quiptic",
  ).mkString("|")

  private def parseCrosswords(response: SearchResponse): EditionsCrosswordRenderingDataModel = {
    val collectedItems = response.results.collect {
      case content if content.crossword.isDefined =>
        CrosswordData.fromCrossword(content.crossword.get, content)
    }
    val crosswordDataItems: immutable.Seq[CrosswordData] = collectedItems.toList
    EditionsCrosswordRenderingDataModel(
      crosswordDataItems,
    )
  }
}
