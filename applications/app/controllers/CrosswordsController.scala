package controllers

import com.gu.contentapi.client.model.{Content => ApiContent, Crossword, Section => ApiSection}
import common.{Edition, ExecutionContexts}
import conf.{LiveContentApi, Static}
import crosswords.{AccessibleCrosswordRows, CrosswordData, CrosswordPage, CrosswordSearchPage, CrosswordSvg}
import model.{Cached, Cors, _}
import org.joda.time.DateTime
import play.api.data.Forms._
import play.api.data._
import play.api.mvc.{Action, Controller, RequestHeader, Result, _}
import services.IndexPage

import scala.concurrent.Future
import scala.concurrent.duration._

object CrosswordsController extends Controller with ExecutionContexts {
  protected def withCrossword(crosswordType: String, id: Int)(f: (Crossword, ApiContent) => Result)(implicit request: RequestHeader): Future[Result] = {
    LiveContentApi.getResponse(LiveContentApi.item(s"crosswords/$crosswordType/$id", Edition(request)).showFields("all")).map { response =>
       val maybeCrossword = for {
        content <- response.content
        crossword <- content.crossword }
       yield f(crossword, content)
       maybeCrossword getOrElse InternalServerError("Crossword response from Content API invalid.")
    } recover { case _ => InternalServerError("Content API query returned an error.") }
  }

  def crossword(crosswordType: String, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { (crossword, content) =>
      Cached(60)(Ok(views.html.crossword(
        new CrosswordPage(CrosswordData.fromCrossword(crossword), content),
         CrosswordSvg(crossword, None, None, false)
      )))
    }
  }

  def accessibleCrossword(crosswordType: String, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { (crossword, content) =>
      Cached(60)(Ok(views.html.accessibleCrossword(
        new CrosswordPage(CrosswordData.fromCrossword(crossword), content),
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

object CrosswordSearchController extends Controller with ExecutionContexts {
  def searchForm() = Action { implicit request =>
    Cached(60)(Ok(views.html.crosswordSearch(CrosswordSearchPage)))
  }

  def search() = Action.async { implicit request =>
    CrosswordSearch.fromRequest(request) match {
      case Some(params) =>
        val withoutSetter = LiveContentApi.item(s"crosswords/series/${params.crosswordType}")
          .stringParam("from-date", params.fromDate.toString("yyyy-MM-dd"))
          .stringParam("to-date", params.toDate.toString("yyyy-MM-dd"))
          .pageSize(50)

        val maybeSetter = params.setter.fold(withoutSetter) { setter =>
          withoutSetter.stringParam("tag", s"profile/${setter}")
        }

        LiveContentApi.getResponse(maybeSetter.showFields("all")).map { response =>
          response.results match {
            case Nil =>
              Cached(60)(Ok(views.html.crosswordsNoResults(CrosswordSearchPage)))

            case results =>
              val section = Section(ApiSection("crosswords", "Crosswords search results", "http://www.theguardian.com/crosswords/search", "", Nil))
              val page = IndexPage(section, results.map(Content(_)))

              Cached(60)(Ok(views.html.index(page)))
          }
        }

      case None =>
        Future.successful(NotFound)
    }
  }

  def lookup() = Action { implicit request =>
    val form = Form(
      mapping(
        "type" -> text,
        "id" -> number
      )(CrosswordLookup.apply)(CrosswordLookup.unapply)
    )

    form.bindFromRequest.get match {
      case CrosswordLookup(crosswordType, id) =>
        Redirect(s"$crosswordType/$id")
      case _ =>
        Cached(60)(Ok(views.html.crosswordsNoResults(CrosswordSearchPage)))
    }
  }

  case class CrosswordSearch(
    crosswordType: String,
    fromDate: DateTime,
    toDate: DateTime,
    setter: Option[String])

  object CrosswordSearch {
    def fromRequest(request: Request[AnyContent]): Option[CrosswordSearch] = {
      for {
        formMap <- request.body.asFormUrlEncoded
        crosswordType <- formMap.get("crossword-type").map(_.mkString)
        month <- formMap.get("month").map(_.mkString.toInt)
        year <- formMap.get("year").map(_.mkString.toInt)
      } yield {
        val setter = formMap.get("setter").map(_.mkString.toLowerCase).filter(_.nonEmpty)
        val fromDate = new DateTime(year, month, 1, 0, 0)
        val toDate = fromDate.dayOfMonth.withMaximumValue

        CrosswordSearch(crosswordType, fromDate, toDate, setter)
      }
    }
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
