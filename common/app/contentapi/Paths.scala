package contentapi

import common.Edition

object Paths {
  def withoutEdition(path: String) = (path.split("/").toList match {
    case maybeEdition :: rest if Edition.byId(maybeEdition).isDefined => Some(rest.mkString("/"))
    case _ => None
  }).filter(_.nonEmpty)
}
