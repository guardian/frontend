package controllers.front

import common._
import model.FaciaPage


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
  }

  def refresh() = refreshJobs().foreach(_())

  def refreshJobs() = Seq(() => {
      ConfigAgent.refresh()
      refreshPageFrontAgent()
    }) ++ pageFrontAgent().values.map{ agent => () => agent.refresh() }

  def apply(path: String): Option[FaciaPage] = pageFrontAgent().get(path).flatMap(pageFront => pageFront())
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)