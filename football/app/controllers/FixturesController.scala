package controllers

import common._
import play.api.mvc.{ Action, Controller }
import feed.Competitions
import model.{ CachedOk, Competition, MetaData, Page }

case class FixturesPage(page: MetaData, competitions: Seq[Competition])

object FixturesController extends Controller with Logging {

  val page = Page("http://www.guardian.co.uk/football/matches", "football/fixtures", "football", "", "Football fixtures")

  def render() = Action { implicit request =>

    val competitions = Competitions.all

    CachedOk(page) {
      Compressed(views.html.fixtures(FixturesPage(page, competitions)))
    }
  }
}
