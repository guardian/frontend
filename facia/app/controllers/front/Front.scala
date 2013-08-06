package controllers.front

import model.Trailblock
import common.{ Edition, Logging, AkkaScheduler }
import common.editions.EditionalisedSections._
import scala.concurrent.duration._


//Responsible for bootstrapping the front (setting up the refresh schedule)
class Front extends Logging {

  val refreshDuration = 60.seconds

  private lazy val refreshSchedule = AkkaScheduler.every(refreshDuration, initialDelay = 5.seconds) {
    log.info("Refreshing Front")
    Front.refresh()
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