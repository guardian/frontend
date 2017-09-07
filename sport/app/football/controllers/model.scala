package football.controllers

import com.gu.commercial.branding._
import common.commercial.{CommercialProperties, EditionAdTargeting, EditionBranding}
import common.{Edition, Pagination}
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
   *
   * Has to be 'def' to pick up current switch state.
   */
  private def brandings: Set[EditionBranding] = Set.empty

  // Has to be 'def' to pick up current switch state
  override def metadata = MetaData
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
