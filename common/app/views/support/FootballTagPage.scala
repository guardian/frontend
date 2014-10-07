package views.support

import conf.Configuration
import model.{Tag, MetaData}

case class FootballTagPage(page: MetaData) {
  lazy val getFootballBadgeUrl: Option[String] = asOpt.flatMap(_.page.metaData.get("references")
    .map(_(0) \ "pa-football-team")
    .flatMap(_.asOpt[String]))
    .map(teamId => s"${Configuration.staticSport.path}/football/crests/120/$teamId.png")

  lazy val asOpt: Option[FootballTagPage] = page match {
    case p: Tag if p.isFootballTeam => Some(FootballTagPage(p))
    case _ => None
  }
}
