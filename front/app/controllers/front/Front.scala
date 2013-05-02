package controllers.front

import model.Trailblock
import common.{Edition, Logging, AkkaSupport}

import scala.concurrent.duration._

import com.gu.openplatform.contentapi.model.{ Content => ApiContent }

//Responsible for bootstrapping the front (setting up the refresh schedule)
class Front extends AkkaSupport with Logging {

  val refreshDuration = 60.seconds

  private lazy val refreshSchedule = play_akka.scheduler.every(refreshDuration, initialDelay = 5.seconds) {
    log.info("Refreshing Front")
    Front.refresh()
  }

  // Map of edition -> (path -> front)
  lazy val fronts = Edition.all.map{ edition =>
    edition.id -> edition.configuredFronts.map{ case (name, blocks) =>
      name ->  new ConfiguredEdition(edition, blocks)
    }.toMap
  }.toMap


  private def allFronts = fronts.values.flatMap(_.values)

  def refresh() {
    allFronts.foreach(_.refresh())
  }

  def shutdown() {
    refreshSchedule.cancel()
    allFronts.foreach(_.shutDown())
  }

  def startup() {
    refreshSchedule
  }

  def apply(path: String, edition: Edition): Seq[Trailblock] = fronts(edition.id)(path)()

  lazy val warmup = {
    refresh()
    allFronts.foreach { _.warmup() }
  }

}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)