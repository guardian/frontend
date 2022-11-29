package controllers

import com.gu.contentapi.client.model.v1.{Crossword, ItemResponse, Content => ApiContent, Section => ApiSection}
import common.{Edition, ImplicitControllerExecutionContext, GuLogging}
import conf.Static
import contentapi.ContentApiClient
import pages.{CrosswordHtmlPage, IndexHtmlPage, PrintableCrosswordHtmlPage}
import crosswords.{
  AccessibleCrosswordPage,
  AccessibleCrosswordRows,
  CrosswordPageWithSvg,
  CrosswordSearchPageNoResult,
  CrosswordSearchPageWithResults,
  CrosswordSvg,
}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import org.joda.time.{DateTime, LocalDate}
import play.api.data.Forms._
import play.api.data._
import play.api.mvc.{Action, RequestHeader, Result, _}
import services.{IndexPage, IndexPageItem}
import html.HtmlPageHelpers.ContentCSSFile

import scala.concurrent.Future
import scala.concurrent.duration._

trait CrosswordController extends BaseController with GuLogging with ImplicitControllerExecutionContext {

  def contentApiClient: ContentApiClient

  def noResults()(implicit request: RequestHeader): Result

  def getCrossword(crosswordType: String, id: Int)(implicit request: RequestHeader): Future[ItemResponse] = {
    contentApiClient.getResponse(
      contentApiClient.item(s"crosswords/$crosswordType/$id", Edition(request)).showFields("all"),
    )
  }

  def withCrossword(crosswordType: String, id: Int)(
      f: (Crossword, ApiContent) => Result,
  )(implicit request: RequestHeader): Future[Result] = {
    getCrossword(crosswordType, id).map { response =>
      val maybeCrossword = for {
        content <- response.content
        crossword <- content.crossword
      } yield f(crossword, content)
      maybeCrossword getOrElse noResults()
    } recover {
      case t: Throwable =>
        log.error(s"Error retrieving $crosswordType crossword id $id from API", t)
        noResults()
    }
  }

  def renderCrosswordPage(crosswordType: String, id: Int)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Future[Result] = {
    withCrossword(crosswordType, id) { (crossword, content) =>
      Cached(60)(
        RevalidatableResult.Ok(
          CrosswordHtmlPage.html(
            CrosswordPageWithSvg(
              CrosswordContent.make(CrosswordData.fromCrossword(crossword, content), content),
              CrosswordSvg(crossword, None, None, false),
            ),
          ),
        ),
      )
    }
  }
}

class CrosswordPageController(val contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)(
    implicit context: ApplicationContext,
) extends CrosswordController {

  def noResults()(implicit request: RequestHeader): Result =
    Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))

  def crossword(crosswordType: String, id: Int): Action[AnyContent] =
    Action.async { implicit request =>
      renderCrosswordPage(crosswordType, id)
    }

  def accessibleCrossword(crosswordType: String, id: Int): Action[AnyContent] =
    Action.async { implicit request =>
      withCrossword(crosswordType, id) { (crossword, content) =>
        Cached(60)(
          RevalidatableResult.Ok(
            CrosswordHtmlPage.html(
              AccessibleCrosswordPage(
                CrosswordContent.make(
                  CrosswordData
                    .fromCrossword(crossword.copy(name = s"Accessible version of ${crossword.name}"), content),
                  content,
                ),
                AccessibleCrosswordRows(crossword),
              ),
            ),
          ),
        )
      }
    }

  def printableCrossword(crosswordType: String, id: Int): Action[AnyContent] =
    Action.async { implicit request =>
      withCrossword(crosswordType, id) { (crossword, content) =>
        Cached(3.days)(
          RevalidatableResult.Ok(
            PrintableCrosswordHtmlPage.html(
              CrosswordPageWithSvg(
                CrosswordContent.make(CrosswordData.fromCrossword(crossword, content), content),
                CrosswordSvg(crossword, None, None, false),
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

        Cached(60) {
          val body = s"""$xml"""
          RevalidatableResult(
            Cors {
              Ok(body).as("image/svg+xml")
            },
            body,
          )
        }
      }
    }
}

class CrosswordSearchController(
    val contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
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

            contentApiClient.getResponse(maybeSetter.showFields("all")).map {
              response =>
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
