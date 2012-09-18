package controllers.front

import java.util.concurrent.TimeUnit._
import controllers.FrontPage
import model.TrailblockDescription
import akka.actor.Cancellable
import play.api.Play
import Play.current
import org.joda.time.DateTime
import common.{ Logging, AkkaSupport }

//Responsible for holding the definition of the two editions
class Front extends AkkaSupport with Logging {

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
    //There is a deadlock problem when running in dev/test mode.
    //dev machines are quick enough that it hardly ever happens, but our teamcity agents are really slow
    //and this causes many broken tests
    //https://groups.google.com/forum/?fromgroups=#!topic/play-framework/yO8GsBLzGGY
    if (!Play.isTest && !refreshSchedule.isDefined) {
      refreshSchedule = Some(play_akka.scheduler.every(refreshDuration, initialDelay = refreshDuration) {
        log.info("Refreshing Front")
        Front.refresh()
      })
    }

    //ensures the app comes up with data for the front
    Front.refresh()
    Front.warmup()
  }

  private def warmup() {
    uk.warmup()
    us.warmup()
  }

  def apply(edition: String): FrontPage = edition match {
    case "US" => FrontPage(us())
    case anythingElse => FrontPage(uk())
  }
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)