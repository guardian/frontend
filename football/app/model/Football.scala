package model

import common.{ Logging, AkkaSupport }

import akka.util.Duration
import java.util.concurrent.TimeUnit._
import pa.Season
import conf.FootballClient
import akka.actor.Cancellable
import org.joda.time.{ Interval, DateMidnight }

object Football extends AkkaSupport with Logging {

  val competitions = play_akka.agent[Seq[Season]](Nil)

  def competitionsOpenOn(date: DateMidnight) = competitions.get
    .filter(c => new Interval(c.startDate, c.endDate).contains(date))

  private var refreshers: Seq[Cancellable] = Nil

  def start() {
    refreshers = {
      play_akka.scheduler.every(Duration(15, MINUTES)) {
        competitions.sendOff { seasons => FootballClient.competitions }
      } :: Nil
    }
  }

  def stop() {
    refreshers.foreach(_.cancel())
    competitions.close()
  }

}
