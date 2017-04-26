package football.controllers

import com.gu.commercial.branding._
import common.commercial.{CommercialProperties, EditionAdTargeting, EditionBranding}
import common.{Edition, Pagination}
import conf.switches.Switches.sponsoredFootballFeedPages
import implicits.Football
import model._
import org.joda.time.LocalDate

case class MatchesOnDate(date: LocalDate, competitions: Seq[Competition])

case class CompetitionFilter(name: String, url: String)

case class MatchesPage(
    page: MetaData,
    blog: Option[Trail],
    days: Seq[MatchesOnDate],
    nextPage: Option[String],
    previousPage: Option[String],
    pageType: String,
    filters: Map[String, Seq[CompetitionFilter]] = Map.empty,
    comp: Option[Competition]) extends Football {

  lazy val isLive = days.flatMap(_.competitions.flatMap(_.matches)).exists(_.isLive)
  lazy val urlBase = comp.map(c => c.url).getOrElse("/football")
}

class FootballPage(
  id: String,
  section: String,
  webTitle: String,
  pagination: Option[Pagination] = None,
  description: Option[String] = None) extends StandalonePage {

  /*
   * This is a temporary solution:
   * until football feed pages make a call to capi to get branding data,
   * this has to be hardcoded here.
   */
  private lazy val brandings: Seq[EditionBranding] =
    if (sponsoredFootballFeedPages.isSwitchedOn) {
      for (edition <- Edition.all)
        yield
          EditionBranding(
            edition = edition,
            branding = Some(
              Branding(
                brandingType = Sponsored,
                sponsorName = "Virgin Media",
                logo = Logo(
                  src =
                    "https://static.theguardian.com/commercial/sponsor/13/Apr/2017/c6d9da81-380a-48f3-bd23-2320bb54b5f2-vm-b-logo-red-cmyk-reg140x90.png",
                  dimensions = Some(Dimensions(width = 140, height = 90)),
                  link = "http://www.virginmedia.com/shop/tv/virgin-media-football.html",
                  label = "Supported by"
                ),
                logoForDarkBackground = None,
                aboutThisLink = "https://www.theguardian.com/info/2016/jan/25/content-funding",
                hostedCampaignColour = None
              ))
          )
    } else Nil

  override val metadata = MetaData
    .make(
      id = id,
      section = Some(SectionSummary.fromId(section)),
      webTitle = webTitle,
      pagination = pagination,
      description = description
    )
    .copy(
      commercial = Some(
        CommercialProperties(
          editionAdTargetings = EditionAdTargeting.forFrontUnknownToCapi(id),
          editionBrandings = brandings
        )
      )
    )
}
