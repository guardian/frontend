package feed

import common.AkkaSupport
import conf.FootballClient
import model.Competition
import akka.util.{ Duration, Timeout }
import akka.util.duration._
import org.joda.time.{ DateMidnight, Interval }
import java.util.concurrent.TimeUnit
import akka.actor.Cancellable

trait Competitions extends AkkaSupport {

  private var schedules: List[Cancellable] = Nil

  val competitions = Seq(
    Competition("/football/premierleague", "Premier league", "Prem", new FixtureAgent("100")),
    Competition("/football/championsleague", "Champions league", "np", new FixtureAgent("101"))
  )

  def startup() {
    schedules = play_akka.scheduler.every(Duration(5, TimeUnit.MINUTES)) {
      competitions.foreach(_.fixturesAgent.refresh())
    } :: schedules
  }

  def shutDown() {
    schedules.foreach(_.cancel())
  }
}

object Competitions extends Competitions