package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import org.joda.time.DateMidnight
import model.Page
import conf.Configuration

object LiveMatchesController extends Controller with Logging {

  val page = new Page("http://www.guardian.co.uk/football/matches", "football/live", "football", "", "Today's matches") {
    override val cacheSeconds = 10
  }

  def render = Action { implicit request =>

    val today = new DateMidnight()

    val blog = LiveBlog(Edition(request, Configuration))

    val matches = Seq(MatchesOnDate(today, Competitions.withMatchesOn(today).competitions))

    val livePage = MatchesPage(page, blog,
      matches.filter(_.competitions.nonEmpty),
      nextPage = None,
      previousPage = None,
      pageType = "live")

    Cached(page) {
      request.getQueryString("callback").map { callback =>
        JsonComponent(views.html.fragments.matchesList(livePage))
      }.getOrElse(Ok(Compressed(views.html.matches(livePage))))
    }
  }
}
