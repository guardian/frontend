package common.editions

import org.joda.time.DateTimeZone
import model._
import common._
import contentapi.QueryDefaults
import common.NavItem


//This object exists to be used with ItemTrailblockDescription and is not a real edition like the others.
//All that is really being used is Edition.id, which is AU
//It is not included in the Edition.all sequence
object Au extends Edition(
  id = "AU",
  displayName = "Australia edition",
  DateTimeZone.forID("Australia/Sydney")
  ) with Zones with QueryDefaults {

  implicit val AU = Au

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

  def navigation(metadata: MetaData) = Seq(
    NavItem(home),
    NavItem(uk),
    NavItem(world),
    NavItem(cif),
    NavItem(sport, Seq(football, cricket, tennis, rugbyunion, cycling, usSport)),
    footballNav(metadata),
    NavItem(lifeandstyle),
    NavItem(culture),
    NavItem(economy),
    NavItem(travel),
    NavItem(technology),
    NavItem(environment)
  )
}
