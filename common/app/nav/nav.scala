package nav

import model.{Tag, Link, MetaData}
import java.net.URLEncoder._


case class NavItem(name: String, url: String, links: Seq[NavItem] = Nil, current: Boolean = false) {
  lazy val dataLinkName  = s"nav: ${encode(name, "UTF-8")}"

  def currentFor(metadata: MetaData) = {
    val sectionId = s"/${metadata.section}"
    sectionId == url || url == s"/${metadata.id}" || links.exists(_.url == sectionId)
  }
}

object Navigation {

  def apply(metadata: MetaData) = Seq(
    NavItem("Home", "/"),
    NavItem("UK", "/uk", Seq(
      NavItem("Politics", "/politics"), NavItem("Media", "/media"), NavItem("Science", "/science"),
      NavItem("Society", "/society"), NavItem("Crime", "/uk/ukcrime"))
    ),
    football(metadata)
  )


  def football(metaData: MetaData) = metaData match {
    case tag: Tag if tag.isFootballTeam => NavItem("Football", "/football", Seq(
      NavItem("Tables", "/football/tables"), NavItem("Live scores", "/football/live"),
      NavItem("Fixtures", s"${tag.url}/fixtures"), NavItem("Results", s"${tag.url}/results"),
      NavItem("Teams", "/football/teams"), NavItem("Leagues & competitions", "/football/competitions")
    ))
    case tag: Tag if tag.isFootballCompetition => NavItem("Football", "/football", Seq(
      NavItem("Tables", s"${tag.url}/tables"), NavItem("Live scores", s"${tag.url}/live"),
      NavItem("Fixtures", s"${tag.url}/fixtures"), NavItem("Results", s"${tag.url}/results"),
      NavItem("Teams", "/football/teams"), NavItem("Leagues & competitions", "/football/competitions")
    ))
    case _ => NavItem("Football", "/football", Seq(
      NavItem("Tables", "/football/tables"), NavItem("Live scores", "/football/live"),
      NavItem("Fixtures", "/football/fixtures"), NavItem("Results", "/football/results"),
      NavItem("Teams", "/football/teams"), NavItem("Leagues & competitions", "/football/competitions")
    ))
  }
}




//trait LinkGenerator {
//  def links(metadata: MetaData): Seq[Link]
//}
//
//
//object SectionGenerator extends LinkGenerator {
//  val sectionLinks = Map(
//    "world" -> Seq(Link("/foo", "foo", "Foo"))
//  )
//  val default = Seq(Link("/foo", "foo", "Foo"))
//  def links(metadata: MetaData): Seq[Link] = sectionLinks.get(metadata.section).getOrElse(default)
//}
//
//object FootballGenerator extends LinkGenerator {
//
//  def links(metadata: MetaData) = metadata match {
//
//    case tag: Tag if tag.isFootballCompetition => Seq(
//      Link(s"/${tag.id}/table", "", "")
//    )
//    case tag: Tag if tag.isFootballTeam => ???
//
//    case s if s.section == "football" => Seq(Link("/foo", "foo", "Foo"))
//
//    case _ => Nil
//  }
//
//}
//
//
//object Navigation extends LinkGenerator {
//
//  val generators = Seq(FootballGenerator, SectionGenerator)
//
//  def links(metadata: MetaData): Seq[Link] = generators.map(g => g.links(metadata)).find(_.nonEmpty).getOrElse(Nil)
//}

