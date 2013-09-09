package controllers.front

import common._
import common.editions.EditionalisedSections._
import model.{FaciaPage, Trailblock}


class Front extends Logging {

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

  def refreshPageFrontAgent() = {
    val newFronts = faciaFronts
    pageFrontAgent.send{ oldValue =>
      val newFrontsFiltered = newFronts.filterNot {
        case (id, pageFront) => oldValue.contains(id)
      }
      oldValue ++ newFrontsFiltered
    }
    pageFrontAgent().values.foreach(_.refresh())
  }

  def refresh() {
    log.info("Refreshing Front")
    ConfigAgent.refresh()
    refreshPageFrontAgent()
  }

  def apply(path: String): FaciaPage = pageFrontAgent()(path)()
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)