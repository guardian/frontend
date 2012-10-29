package controllers.front

import java.util.concurrent.TimeUnit._
import controllers.FrontPage
import model.TrailblockDescription
import akka.actor.Cancellable
import common.{ Logging, AkkaSupport }
import akka.util.Duration
import views.support.Featured

//Responsible for holding the definition of the two editions
//and bootstrapping the front (setting up the refresh schedule)
class Front extends AkkaSupport with Logging {

  val refreshDuration = Duration(60, SECONDS)

  private var refreshSchedule: Option[Cancellable] = None

  val ukEditions = Map(

    "front" -> new ConfiguredEdition("UK", Seq(
      TrailblockDescription("", "News", numItemsVisible = 5, numLargeImages = 2),
      TrailblockDescription("sport", "Sport", numItemsVisible = 5, numLargeImages = 1),
      TrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3),
      TrailblockDescription("culture", "Culture", numItemsVisible = 1),
      TrailblockDescription("business", "Business", numItemsVisible = 1),
      TrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1),
      TrailblockDescription("money", "Money", numItemsVisible = 1),
      TrailblockDescription("travel", "Travel", numItemsVisible = 1)
    )),

    "sport" -> new FrontEdition("UK", Seq(
      TrailblockDescription("sport", "Sport", numItemsVisible = 5),
      TrailblockDescription("football", "Football", numItemsVisible = 3),
      TrailblockDescription("sport/cricket", "Cricket", numItemsVisible = 1),
      TrailblockDescription("sport/rugby-union", "Rugby Union", numItemsVisible = 1),
      TrailblockDescription("sport/motorsports", "Motor Sport", numItemsVisible = 1),
      TrailblockDescription("sport/tennis", "Tennis", numItemsVisible = 1),
      TrailblockDescription("sport/golf", "Golf", numItemsVisible = 1),
      TrailblockDescription("sport/horse-racing", "Horse Racing", numItemsVisible = 1),
      TrailblockDescription("sport/rugbyleague", "Rugby League", numItemsVisible = 1),
      TrailblockDescription("sport/us-sport", "US Sport", numItemsVisible = 1),
      TrailblockDescription("sport/boxing", "Boxing", numItemsVisible = 1),
      TrailblockDescription("sport/cycling", "Cycling", numItemsVisible = 1)
    ))
  )

  val usEditions = Map(

    "front" -> new ConfiguredEdition("US", Seq(
      TrailblockDescription("", "News", numItemsVisible = 5, numLargeImages = 2),
      TrailblockDescription("sport", "Sports", numItemsVisible = 5, numLargeImages = 1),
      TrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3),
      TrailblockDescription("culture", "Culture", numItemsVisible = 1),
      TrailblockDescription("business", "Business", numItemsVisible = 1),
      TrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1),
      TrailblockDescription("money", "Money", numItemsVisible = 1),
      TrailblockDescription("travel", "Travel", numItemsVisible = 1)
    )),

    "sport" -> new FrontEdition("US", Seq(
      TrailblockDescription("sport", "Sports", numItemsVisible = 5),
      TrailblockDescription("sport/nfl", "NFL", numItemsVisible = 1)
    ))

  )

  private def allFronts = ukEditions.toSeq ++ usEditions.toSeq

  def refresh() {
    allFronts.foreach { case (name, front) => front.refresh() }
  }

  def shutdown() {
    refreshSchedule foreach { _.cancel() }
    allFronts.foreach { case (name, front) => front.shutDown() }
  }

  def startup() {
    refreshSchedule = Some(play_akka.scheduler.every(refreshDuration, initialDelay = Duration(5, SECONDS)) {
      log.info("Refreshing Front")
      Front.refresh()
    })
  }

  def apply(path: String, edition: String): FrontPage = edition match {
    case "US" => FrontPage(usEditions(path)())
    case anythingElse => FrontPage(ukEditions(path)())
  }

  def warmup() {
    refresh()
    allFronts.foreach { case (name, front) => front.warmup() }
  }
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)