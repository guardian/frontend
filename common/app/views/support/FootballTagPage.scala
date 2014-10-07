package views.support

import model.{MetaData, Tag}

case class FootballTagPage(page: MetaData) {
  lazy val getFootballBadgeUrl: Option[String] = asOpt.flatMap(_.getFootballBadgeUrl)

  lazy val asOpt: Option[FootballTagPage] = page match {
    case p: Tag if p.isFootballTeam => Some(FootballTagPage(p))
    case _ => None
  }
}
