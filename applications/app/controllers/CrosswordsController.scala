package controllers

import com.gu.contentapi.client.model.{Content => ApiContent, Crossword, Section => ApiSection}
import common.{Edition, ExecutionContexts}
import conf.{LiveContentApi, Static}
import crosswords.{AccessibleCrosswordRows, CrosswordPage, CrosswordSearchPage, CrosswordSvg}
import model._
import org.joda.time.LocalDate
import play.api.data.Forms._
import play.api.data._
import play.api.mvc.{Action, Controller, RequestHeader, Result, _}
import services.{IndexPageItem, IndexPage}

import scala.concurrent.Future
import scala.concurrent.duration._

trait CrosswordController extends Controller with ExecutionContexts {
  def noResults()(implicit request: RequestHeader): Result

  protected def withCrossword(crosswordType: String, id: Int)(f: (Crossword, ApiContent) => Result)(implicit request: RequestHeader): Future[Result] = {
    LiveContentApi.getResponse(LiveContentApi.item(s"crosswords/$crosswordType/$id", Edition(request)).showFields("all")).map { response =>
       val maybeCrossword = for {
        content <- response.content
        crossword <- content.crossword }
       yield f(crossword, content)
       maybeCrossword getOrElse noResults
    } recover { case _ => noResults }
  }

  def renderCrosswordPage(crosswordType: String, id: Int)(implicit request: RequestHeader): Future[Result] = {
    withCrossword(crosswordType, id) { (crossword, content) =>
      Cached(60)(Ok(views.html.crossword(
        CrosswordPage(CrosswordContent.make(CrosswordData.fromCrossword(crossword), content)),
         CrosswordSvg(crossword, None, None, false)
      )))
    }
  }
}

object CrosswordPageController extends CrosswordController {

  def noResults()(implicit request: RequestHeader) = InternalServerError("Content API query returned an error.")

  def crossword(crosswordType: String, id: Int) = Action.async { implicit request =>
    renderCrosswordPage(crosswordType, id)
  }

  def accessibleCrossword(crosswordType: String, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { (crossword, content) =>
      Cached(60)(Ok(views.html.accessibleCrossword(
        new CrosswordPage(CrosswordContent.make(CrosswordData.fromCrossword(crossword), content)),
        AccessibleCrosswordRows(crossword)
      )))
    }
  }

  def thumbnail(crosswordType: String, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { (crossword, _) =>
      val xml = CrosswordSvg(crossword, Some("100%"), Some("100%"), trim = true)

      val globalStylesheet = Static("stylesheets/content.css")

      Cached(60) {
        Cors {
          Ok( s"""<?xml-stylesheet type="text/css" href="$globalStylesheet" ?>$xml""").as("image/svg+xml")
        }
      }
    }
  }
}

object CrosswordSearchController extends CrosswordController {
  val searchForm = Form(
    mapping(
      "crossword_type" -> nonEmptyText,
      "month" -> number,
      "year" -> number,
      "setter" -> optional(text)
    )(CrosswordSearch.apply)(CrosswordSearch.unapply)
  )

  val lookupForm = Form(
    mapping(
      "crossword_type" -> nonEmptyText,
      "id" -> number
    )(CrosswordLookup.apply)(CrosswordLookup.unapply)
  )

  def noResults()(implicit request: RequestHeader) = Cached(7.days)(Ok(views.html.crosswordsNoResults(CrosswordSearchPage.make())))

  def search() = Action.async { implicit request =>
    searchForm.bindFromRequest.fold(
      empty => Future.successful(Cached(7.days)(Ok(views.html.crosswordSearch(CrosswordSearchPage.make())))),

      params => {
        val withoutSetter = LiveContentApi.item(s"crosswords/series/${params.crosswordType}")
          .stringParam("from-date", params.fromDate.toString("yyyy-MM-dd"))
          .stringParam("to-date", params.toDate.toString("yyyy-MM-dd"))
          .pageSize(50)

        val maybeSetter = params.setter.fold(withoutSetter) { setter =>
          withoutSetter.stringParam("tag", s"profile/${setter.toLowerCase}")
        }

        LiveContentApi.getResponse(maybeSetter.showFields("all")).map { response =>
          response.results match {
            case Nil => noResults

            case results =>
              val section = Section.make(ApiSection("crosswords", "Crosswords search results", "http://www.theguardian.com/crosswords/search", "", Nil))
              val page = IndexPage(section, results.map(IndexPageItem(_)))

              Cached(15.minutes)(Ok(views.html.index(page)))
          }
        }
      }
    )
  }

  def lookup() = Action.async { implicit request =>
    lookupForm.bindFromRequest.get match {
      case CrosswordLookup(crosswordType, id) => renderCrosswordPage(crosswordType, id)
      case _ => Future.successful(noResults)
    }
  }

  case class CrosswordSearch(crosswordType: String,
                             month: Int,
                             year: Int,
                             setter: Option[String]) {
    val fromDate = new LocalDate(year, month, 1)
    val toDate = fromDate.dayOfMonth.withMaximumValue.minusDays(1)
  }

  case class CrosswordLookup(crosswordType: String, id: Int)
}

object CrosswordPreferencesController extends Controller with PreferenceController {
  private val CrosswordOptIn = "crossword_opt_in"
  private val CrosswordOptInPath= "/crosswords"
  private val CrosswordOptInMaxAge = 14.days.toSeconds.toInt
  private val CrosswordOptOutMaxAge = 60.days.toSeconds.toInt

  def crosswordsOptIn = Action { implicit request =>
    Cached(60)(SeeOther("/crosswords?view=beta").withCookies(
      Cookie(
        CrosswordOptIn, "true",
        path = CrosswordOptInPath,
        maxAge = Some(CrosswordOptInMaxAge),
        domain = getShortenedDomain(request.domain)
      )
    ))
  }

  def crosswordsOptOut = Action { implicit request =>
    Cached(60)(SeeOther("/crosswords?view=classic").withCookies(
      Cookie(
        CrosswordOptIn, "false",
        path = CrosswordOptInPath,
        maxAge = Some(CrosswordOptOutMaxAge),
        domain = getShortenedDomain(request.domain)
      )
    ))
  }
}
