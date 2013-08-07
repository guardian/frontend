package controllers.front

import common._
import common.editions.EditionalisedSections._
import model.Trailblock


//Responsible for bootstrapping the front (setting up the refresh schedule)
class Front extends Logging {

  private def allFronts = fronts.values

  object FrontRefreshJob extends Job with ExecutionContexts {
    val cron = "0 * * * * ?"
    val metric = FrontMetrics.FrontLoadTimingMetric

    def run() {
      log.info("Refreshing Front")
      allFronts.foreach(_.refresh())
    }
  }

  def idFromEditionKey(section: String): String = {
    val editions = Edition.all.map {_.id.toLowerCase}
    val sectionId = section.split("/").last
    if (editions.contains(sectionId)) "" else sectionId
  }

  lazy val fronts: Map[String, FrontEdition] = Edition.all.flatMap{ edition =>
    edition.configuredFrontsFacia.filter{ front => isEditionalised(idFromEditionKey(front._1)) || (!isEditionalised(idFromEditionKey(front._1)) && edition == Edition.defaultEdition) }.map{
      case (name, trailblockDescriptions) => name ->  new FrontEdition(edition, trailblockDescriptions)
    }.toMap
  }.toMap

  def start() { Jobs.schedule(FrontRefreshJob) }
  def refresh() { FrontRefreshJob.run() }
  def stop() { allFronts.foreach(_.shutDown()) }

  def apply(path: String): Seq[Trailblock] = fronts(path)()
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)