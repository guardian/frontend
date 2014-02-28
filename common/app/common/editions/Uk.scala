package common.editions

import common._
import org.joda.time.DateTimeZone
import model.MetaData


object Uk extends Edition(
  id = "UK",
  displayName = "UK edition",
  timezone = DateTimeZone.forID("Europe/London")
  ) with Zones {

  implicit val UK = Uk
  val zones = Seq(
    newsZone,
    sportZone,
    cifZone,
    cultureZone,
    technologyZone,
    businessZone,
    moneyZone,
    lifeandstyleZone,
    travelZone
  )

  def navigation(metadata: MetaData): Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(uk),
    NavItem(world),
    NavItem(cif),
    NavItem(sport, Seq(football, cricket, tennis, rugbyunion, cycling, usSport)),
    footballNav(metadata),
    NavItem(lifeandstyle),
    NavItem(culture, Seq(film, music, books, televisionandradio, artanddesign, stage)),
    NavItem(business),
    NavItem(travel),
    NavItem(technology),
    NavItem(environment)
  )
}
