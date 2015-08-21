package controllers.front

import common._

class Front extends Logging {

  def idFromEditionKey(section: String): String = {
    val editions = Edition.all.map {_.id.toLowerCase}
    val sectionId = section.split("/").last
    if (editions.contains(sectionId)) "" else sectionId
  }

}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)
