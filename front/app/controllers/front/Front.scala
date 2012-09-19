package controllers.front

import java.util.concurrent.TimeUnit._
import controllers.FrontPage
import model.TrailblockDescription
import akka.actor.Cancellable
import play.api.Play
import Play.current
import org.joda.time.DateTime
import common.{ PlainOldScheduling, Logging, AkkaSupport }
import java.util.concurrent.TimeUnit

//Responsible for holding the definition of the two editions
//and bootstrapping the front (setting up the refresh schedule)
class Front extends AkkaSupport with PlainOldScheduling with Logging {

  val refreshDuration = akka.util.Duration(60, SECONDS)

  private var refreshSchedule: Option[Cancellable] = None

  val uk = new FrontEdition("UK", Seq(
    TrailblockDescription("", "News", 5),
    TrailblockDescription("sport", "Sport", 5),
    TrailblockDescription("commentisfree", "Comment is free", 3),
    TrailblockDescription("culture", "Culture", 1),
    TrailblockDescription("business", "Business", 1),
    TrailblockDescription("lifeandstyle", "Life and style", 1),
    TrailblockDescription("money", "Money", 1),
    TrailblockDescription("travel", "Travel", 1)
  ))

  val us = new FrontEdition("US", Seq(
    TrailblockDescription("", "News", 5),
    TrailblockDescription("sport", "Sports", 5),
    TrailblockDescription("commentisfree", "Comment is free", 3),
    TrailblockDescription("culture", "Culture", 1),
    TrailblockDescription("business", "Business", 1),
    TrailblockDescription("lifeandstyle", "Life and style", 1),
    TrailblockDescription("money", "Money", 1),
    TrailblockDescription("travel", "Travel", 1)
  ))

  def refresh() {
    uk.refresh()
    us.refresh()
  }

  def shutdown() {
    refreshSchedule foreach { _.cancel() }
    uk.shutDown()
    us.shutDown()
  }

  def startup() {
    executor.scheduleOnce(3, TimeUnit.SECONDS) {
      refreshSchedule = Some(play_akka.scheduler.every(refreshDuration) {
        log.info("Refreshing Front")
        Front.refresh()
      })
    }
  }

  def apply(edition: String): FrontPage = edition match {
    case "US" => FrontPage(us())
    case anythingElse => FrontPage(uk())
  }

  def warmup() {
    refresh()
    uk.warmup()
    us.warmup()
  }
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)