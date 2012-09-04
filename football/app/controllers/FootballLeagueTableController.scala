package controllers

import conf._
import common._
import play.api.mvc.{ Content => _, _ }
import play.api.templates.Html

import play.api.Play.current
import play.api.libs.concurrent.Akka
import org.joda.time.DateMidnight

object FootballLeagueTableController extends Controller with Logging {

  def render(competitionId: String) = Action {
    implicit request =>

      val tomorrow = new DateMidnight()

      val promiseOfLeagueTable = Akka.future(FootballClient.leagueTable(competitionId, tomorrow))

      Async {
        promiseOfLeagueTable.map {
          table =>

            val cssFile = Static("stylesheets/football.min.css").toString

            val leagueTable = views.html.fragments.leagueTable(table.take(5))
            JsonComponent("table" -> leagueTable, "cssUrl" -> Html(cssFile))
        }
      }
  }
}
