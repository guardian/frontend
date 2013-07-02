package common.editions

import common._
import org.joda.time.DateTimeZone
import model._
import views.support.{Headline, Thumbnail, Featured}
import scala.Some
import common.NavItem
import conf.ContentApi
import scala.Some
import common.NavItem


object Uk extends Edition(
  id = "UK",
  displayName = "UK edition",
  timezone = DateTimeZone.forID("Europe/London"),
  hreflang = "en-gb") with Sections with Zones {

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

  def navigation(metadata: MetaData) = Seq(
      NavItem(home),
      NavItem(uk, Seq(politics, media, science, society, health, education)),
      NavItem(world, Seq(us, europe, middleeast, asiapacific, africa, americas)),
      NavItem(cif, Seq(cifbelief, cifgreen)),
      NavItem(sport, Seq(football, cricket, tennis, rugbyunion, cycling)),
      footballNav(metadata),
      NavItem(lifeandstyle, Seq(foodanddrink, fashion, relationships, healthandwellbeing, women)),
      NavItem(culture, Seq(film, music, books, televisionandradio, artanddesign, stage)),
      NavItem(business, Seq(economics, banking, property, workandcareers, savings)),
      NavItem(travel, Seq(shortbreaks, uktravel, europetravel, hotels, resturants)),
      NavItem(technology, Seq(internet, games, mobilephones, appsblog)),
      NavItem(environment, Seq(climatechange, wildlife, energy, conservation, food))
    )


  val configuredFronts = Map(
    Editionalise("", Uk) -> Seq(
      RunningOrderTrailblock("test", "News")
    ),

    Editionalise("sport", Uk) -> Seq(
      RunningOrderTrailblock("test", "News")
    ),

    Editionalise("culture", Uk) -> Seq(
      RunningOrderTrailblock("test", "News")
    ),

    Editionalise("commentisfree", Uk) -> Seq(
      ItemTrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("business", Uk) -> Seq(
      ItemTrailblockDescription("business", "Business", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("money", Uk) -> Seq(
      ItemTrailblockDescription("money", "Money", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("australia", Uk) -> Seq(
      RunningOrderTrailblock("test", "News")

    )
  )
}
