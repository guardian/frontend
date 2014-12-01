package common

import services.ConfigAgent

object PagePaths {
  def fromId(id: String) = if (ConfigAgent.shouldServeFront(id)) {
    AllPagePaths(s"/$id")
  } else {
    SimplePagePaths(s"/$id")
  }
}

trait PagePaths {
  def pathFor(page: Int): String
}

case class SimplePagePaths(basePath: String) extends PagePaths {
  override def pathFor(page: Int): String = if (page <= 1) {
    basePath
  } else {
    s"$basePath?page=$page"
  }
}

/** If a front, page 1 should link to the all page, not the front */
case class AllPagePaths(basePath: String) extends PagePaths {
  override def pathFor(page: Int): String = if (page <= 1) {
    s"$basePath/all"
  } else {
    s"$basePath?page=$page"
  }
}
