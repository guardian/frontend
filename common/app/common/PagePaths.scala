package common

import model.ApplicationContext
import play.api.mvc.RequestHeader
import services.ConfigAgent

object PagePaths {
  def fromId(id: String)(implicit request: RequestHeader, context: ApplicationContext): PagePaths = {
    if (ConfigAgent.shouldServeFront(id) || ConfigAgent.shouldServeEditionalisedFront(Edition(request), id)) {
      AllPagePaths(s"/$id")
    } else {
      SimplePagePaths(s"/$id")
    }
  }
}

trait PagePaths {
  def pathFor(page: Int): String
}

case class SimplePagePaths(path: String) extends PagePaths {
  override def pathFor(page: Int): String =
    if (page <= 1) {
      s"$path"
    } else {
      s"$path?page=$page"
    }
}

/** If a front, page 1 should link to the all page, not the front */
case class AllPagePaths(path: String) extends PagePaths {
  override def pathFor(page: Int): String =
    if (page <= 1) {
      s"$path/all"
    } else {
      s"$path?page=$page"
    }
}
