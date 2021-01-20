package football.controllers

import common.Pagination
import common.commercial.{CommercialProperties, EditionAdTargeting, PrebidIndexSite}
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
    comp: Option[Competition],
) extends Football {

  lazy val isLive = days.flatMap(_.competitions.flatMap(_.matches)).exists(_.isLive)
  lazy val urlBase = comp.map(c => c.url).getOrElse("/football")
}

class FootballPage(
    id: String,
    section: String,
    webTitle: String,
    pagination: Option[Pagination] = None,
    description: Option[String] = None,
) extends StandalonePage {

  override val metadata: MetaData = MetaData
    .make(
      id = id,
      section = Some(SectionId.fromId(section)),
      webTitle = webTitle,
      pagination = pagination,
      description = description,
    )
    .copy(
      commercial = Some(
        CommercialProperties(
          editionAdTargetings = EditionAdTargeting.forFrontUnknownToCapi(id),
          editionBrandings = Set.empty,
          prebidIndexSites = PrebidIndexSite.forFrontUnknownToCapi(id),
        ),
      ),
    )
}
