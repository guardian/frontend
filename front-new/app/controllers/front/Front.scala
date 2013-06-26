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

  lazy val fronts: Map[String, ConfiguredEdition] = Edition.all.flatMap{ edition =>
    edition.configuredFronts.map{
      case (name, blocks) => name ->  new ConfiguredEdition(edition, blocks)
    }.toMap
  }.toMap

  private def allFronts = fronts.values

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

  def apply(path: String): Seq[Trailblock] = fronts(path)()

}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)