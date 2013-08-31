package controllers.front

import common._
import common.editions.EditionalisedSections._
import model.Trailblock


class Front extends Logging {

  private def allFronts = fronts.values

  def idFromEditionKey(section: String): String = {
    val editions = Edition.all.map {_.id.toLowerCase}
    val sectionId = section.split("/").last
    if (editions.contains(sectionId)) "" else sectionId
  }

  def configList: List[(Edition, String)] = Edition.all.map(e => (e, e.id)).toList ++ ConfigAgent().map(c => (Edition.defaultEdition, c))

  def faciaFronts: Map[String, PageFront] = configList.map {case (e, id) =>
    id.toLowerCase -> new PageFront(id.toLowerCase, e)
  }.toMap

  val pageFrontAgent = AkkaAgent[Map[String, PageFront]](Map.empty)

  def refreshAgent() = {
    val newFronts = faciaFronts
    pageFrontAgent.send{ oldValue =>
      val newFrontsFiltered = newFronts.filterNot {
        case (id, pageFront) => oldValue.contains(id)
      }
      oldValue ++ newFrontsFiltered
    }
    pageFrontAgent().values.foreach(_.refresh())
  }

  lazy val fronts: Map[String, FrontEdition] = Edition.all.flatMap{ edition =>
    edition.configuredFrontsFacia.filter{ front => isEditionalised(idFromEditionKey(front._1)) || (!isEditionalised(idFromEditionKey(front._1)) && edition == Edition.defaultEdition) }.map{
      case (name, trailblockDescriptions) => name ->  new FrontEdition(edition, trailblockDescriptions)
    }.toMap
  }.toMap

  def refresh() {
    log.info("Refreshing Front")
    allFronts.foreach(_.refresh())
    ConfigAgent.refresh()
    refreshAgent()
    faciaFronts.values.foreach(_.refresh())
  }

  def apply(path: String): Seq[Trailblock] = fronts(path)()
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)