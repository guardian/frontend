package navigation

import common.Edition
import common.editions

case class Pillar (
 id: String,
 url: String,
 title: String,
 longDisplayName: String,
 children: EditionalisedNavList
)

case class NavLink2(
 id: String,
 url: String,
 title: String,
 pillar: Pillar,
 parent: Option[NavLink2],
 children: Option[EditionalisedNavList]
)

trait EditionalisedNavList {
  val uk: List[NavLink2]
  val au: List[NavLink2]
  val us: List[NavLink2]
  val int: List[NavLink2]

  def getEditionalisedList(edition: Edition): List[NavLink2] = edition match {
    case editions.Uk => uk
    case editions.Au => au
    case editions.Us => us
    case editions.International => int
  }
}
