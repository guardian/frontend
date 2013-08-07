package controllers.front

import common._
import model.Trailblock


//Responsible for bootstrapping the front (setting up the refresh schedule)
class Front extends Logging {

  private def allFronts = fronts.values

  class FrontRefreshJob extends Job with ExecutionContexts {
    val cron = "0 * * * * ?"
    val metric = FrontMetrics.FrontLoadTimingMetric

    def run() { refresh () }
  }

  lazy val fronts: Map[String, ConfiguredEdition] = Edition.all.flatMap{ edition =>
    edition.configuredFronts.map{
      case (name, blocks) => name ->  new ConfiguredEdition(edition, blocks)
    }.toMap
  }.toMap

  def refresh() {
    log.info("Refreshing Front")
    allFronts.foreach(_.refresh())
  }

  def start() { Jobs.schedule[FrontRefreshJob] }
  def stop() { allFronts.foreach(_.stop()) }

  def apply(path: String): Seq[Trailblock] = fronts(path)()
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)