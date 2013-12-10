package controllers.front

import common._
import model.FaciaPage


class Front extends Logging {

  def idFromEditionKey(section: String): String = {
    val editions = Edition.all.map {_.id.toLowerCase}
    val sectionId = section.split("/").last
    if (editions.contains(sectionId)) "" else sectionId
  }

  def refresh() = refreshJobs().foreach(_())

  def refreshJobs() = Seq(() => {
      ConfigAgent.refresh()}
  ) ++ ConfigAgent.getAllCollectionIds.map{ collectionId => () => CollectionAgent.updateCollectionById(collectionId) }

  def apply(path: String): Option[FaciaPage] = QueryAgents(path)

}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)