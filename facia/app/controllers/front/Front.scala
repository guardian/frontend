package controllers.front

import common._
import model.FaciaPage


class Front extends Logging {

  def idFromEditionKey(section: String): String = {
    val editions = Edition.all.map {_.id.toLowerCase}
    val sectionId = section.split("/").last
    if (editions.contains(sectionId)) "" else sectionId
  }

  def configList: List[(Edition, String)] = Edition.all.map(e => (e, e.id)).toList ++ ConfigAgent.getPathIds.map(c => (Edition.defaultEdition, c))

  def faciaFronts: Map[String, Query] = configList.map {case (e, id) =>
    id.toLowerCase -> new Query(id.toLowerCase, e)
  }.toMap

  val pageFrontAgent = AkkaAgent[Map[String, Query]](FaciaDefaults.getDefaultPageFront)

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
      refreshPageFrontAgent()}
  ) ++ ConfigAgent.getAllCollectionIds.map{ collectionId => () => CollectionCache.updateCollectionById(collectionId) }

  def apply(path: String): Option[FaciaPage] = pageFrontAgent().get(path).flatMap(pageFront => pageFront())

}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)