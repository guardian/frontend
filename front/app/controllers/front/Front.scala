package controllers.front

import java.util.concurrent.TimeUnit._
import controllers.FrontPage
import model.TrailblockDescription
import akka.actor.Cancellable
import common.{ Logging, AkkaSupport }
import akka.util.Duration

//Responsible for holding the definition of the two editions
//and bootstrapping the front (setting up the refresh schedule)
class Front extends AkkaSupport with Logging {

  val refreshDuration = Duration(60, SECONDS)

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
    refreshSchedule = Some(play_akka.scheduler.every(refreshDuration, initialDelay = Duration(5, SECONDS)) {
      log.info("Refreshing Front")
      Front.refresh()

      //TODO this is in wrong place
      ConfiguredFront.refresh()
    })
  }

  def apply(edition: String): FrontPage = {

    val configuredBlocks = ConfiguredFront(edition).toList
    val manualBlocks = edition match {
      case "US" => us()
      case anythingElse => uk()
    }

    manualBlocks.toList match {
      case Nil => FrontPage(configuredBlocks)
      case List(head) => FrontPage(head :: configuredBlocks)
      case head :: tail => FrontPage(head :: configuredBlocks ::: tail)
    }
  }

  def warmup() {
    refresh()
    uk.warmup()
    us.warmup()
  }
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)