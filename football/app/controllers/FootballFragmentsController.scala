package controllers

import conf._
import common._
import play.api.mvc.{ Content => _, _ }
import pa.{ MatchEvents, MatchStats }
import play.api.templates.Html

import play.api.Play.current
import play.api.libs.concurrent.{ Akka, Promise }

object FootballFragmentsController extends Controller with Logging {

  def render(matchId: String) = Action { implicit request =>

    val promiseOfMatchEvents = Akka.future(FootballClient.matchEvents(matchId))
    val promiseOfMatchStats = Akka.future(FootballClient.matchStats(matchId))

    Async {
      promiseOfMatchStats.flatMap { stats: MatchStats =>
        promiseOfMatchEvents.map { events: MatchEvents =>

          val cssFile = Static("stylesheets/football.min.css").toString

          val score = views.html.fragments.scoreLine(events)
          val goals = views.html.fragments.stats(events, stats)
          JsonComponent("score" -> score, "stats" -> goals, "cssUrl" -> Html(cssFile))
        }
      }
    }
  }
}
