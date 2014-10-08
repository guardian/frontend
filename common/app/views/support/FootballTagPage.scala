package views.support

import model.{MetaData, Tag}

case class FootballTagPage(page: MetaData) {
  lazy val getFootballBadgeUrl: Option[String] = asOpt.flatMap(_.getFootballBadgeUrl)

  lazy val asOpt: Option[Tag] = page match {
    case p: Tag if p.isFootballTeam => Some(p)
    case _ => None
  }
}
