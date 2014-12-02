package common

import contentapi.Paths
import services.ConfigAgent

object PagePaths {
  def fromId(id: String) = {
    val idWithoutEdition = Paths.stripEditionIfPresent(id)

    if (ConfigAgent.shouldServeFront(id)) {
      AllPagePaths(idWithoutEdition)
    } else {
      SimplePagePaths(idWithoutEdition)
    }
  }
}

trait PagePaths {
  def pathFor(page: Int): String
}

case class SimplePagePaths(id: String) extends PagePaths {
  override def pathFor(page: Int): String = if (page <= 1) {
    s"/$id"
  } else {
    s"/$id?page=$page"
  }
}

/** If a front, page 1 should link to the all page, not the front */
case class AllPagePaths(id: String) extends PagePaths {
  override def pathFor(page: Int): String = if (page <= 1) {
    s"/$id/all"
  } else {
    s"/$id?page=$page"
  }
}
