package controllers.front

import akka.actor.ActorRef
import common._
import common.editions.EditionalisedSections._
import model.Trailblock


//Responsible for bootstrapping the front (setting up the refresh schedule)
class Front extends Logging {

  private def allFronts = fronts.values
  private var job: Option[ActorRef] = None

  class FrontRefreshJob extends Job with ExecutionContexts {
    val cron = "0 * * * * ?"
    val metric = FrontMetrics.FrontLoadTimingMetric

    def run() { refresh () }
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

  def refresh() {
    log.info("Refreshing Front")
    allFronts.foreach(_.refresh())
  }

  def start() {
    job = Some(Jobs.schedule[FrontRefreshJob])
  }

  def stop() {
    job foreach { Jobs.deschedule }
    job = None
  }

  def apply(path: String): Seq[Trailblock] = fronts(path)()
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)