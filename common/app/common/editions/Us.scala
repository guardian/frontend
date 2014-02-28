package common.editions

import common._
import org.joda.time.DateTimeZone
import model.MetaData
import contentapi.QueryDefaults
import common.NavItem

object Us extends Edition(
  id = "US",
  displayName = "US edition",
  timezone = DateTimeZone.forID("America/New_York")
  ) with Zones with QueryDefaults {

  implicit val US = Us
  val zones = Seq(
    newsZone,
    sportsZone,
    cifZone,
    cultureZone,
    technologyZone,
    businessZone,
    moneyZone,
    lifeandstyleZone,
    travelZone
  )

  def navigation(metadata: MetaData) = Seq(
    NavItem(home),
    NavItem(us),
    NavItem(world),
    NavItem(sports, Seq(nfl, mlb, nba, mls, nhl, football)),
    footballNav(metadata),
    NavItem(cif),
    NavItem(lifeandstyle),
    NavItem(culture, Seq(film, music, books, televisionandradio, artanddesign, stage)),
    NavItem(business),
    NavItem(technology),
    NavItem(environment),
    NavItem(media)
  )
}
