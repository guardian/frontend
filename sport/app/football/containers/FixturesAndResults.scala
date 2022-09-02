package football.containers

import common.Edition
import feed.Competitions
import football.model.{TeamFixturesList, TeamResultsList}
import implicits.Football
import layout._
import model._
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import slices.{Fixed, FixedContainers}
import common.Seqs._

import java.time.LocalDate
import football.views.html.matchList.matchesComponent
import football.views.html.tablesList.tablesComponent
import implicits.Requests._

class CompetitionAndGroupFinder(competitions: Competitions) {
  def windowed(group: Group, teamId: String): Group = {
    group.entries.around(1, 10)(_.team.id == teamId) match {
      case Some(windowedItems) => group.copy(entries = windowedItems)
      case None                => group
    }
  }

  def bestForTeam(teamId: String): Option[CompetitionAndGroup] = {
    for {
      competition <- competitions.mostPertinentCompetitionForTeam(teamId)
      table = Table(competition)
      group <-
        table.groups.find(_.entries.exists(_.team.id == teamId)) orElse
          table.groups.headOption
    } yield CompetitionAndGroup(competition, windowed(group, teamId))
  }
}

case class CompetitionAndGroup(competition: Competition, group: Group)

class FixturesAndResults(competitions: Competitions) extends Football {

  lazy val competitionAndGroupFinder = new CompetitionAndGroupFinder(competitions)
  lazy val teamNameBuilder = new TeamNameBuilder(competitions)

  def makeContainer(
      tagId: String,
  )(implicit request: RequestHeader, context: ApplicationContext): Option[FaciaContainer] = {

    (for {
      teamId <- TeamMap.findTeamIdByUrlName(tagId)
      teamName <- teamNameBuilder.withId(teamId)
    } yield {
      val relevantMatches = competitions.sortedMatches
        .filter({ theMatch =>
          theMatch.homeTeam.id == teamId || theMatch.awayTeam.id == teamId
        })
        .toList

      val container = FixedContainers.footballTeamFixtures

      val fixtureExists = relevantMatches.exists(_.isFixture)
      val resultExists = relevantMatches.exists(_.isResult)
      val leagueTableExists = competitions.mostPertinentCompetitionForTeam(teamId).isDefined
      val cssClasses = Seq("facia-snap--football", "facia-snap-embed")
      val missingComponentClasses = Seq("football-component-missing")

      val maybeCompetitionAndGroup = competitionAndGroupFinder.bestForTeam(teamId).filter(_ => leagueTableExists)

      val now = LocalDate.now(Edition.defaultEdition.timezoneId)
      val fixturesComponent = if (fixtureExists) {
        Some(
          matchesComponent(
            TeamFixturesList(now, competitions.competitions, teamId, tagId, 2),
            Some(s"Show more $teamName fixtures", s"/football/$tagId/fixtures"),
          ),
        )
      } else None
      val resultsComponent = if (resultExists) {
        Some(
          matchesComponent(
            TeamResultsList(now, competitions.competitions, teamId),
            Some(s"Show more $teamName results", s"/football/$tagId/results"),
          ),
        )
      } else None

      if (Seq(maybeCompetitionAndGroup, fixturesComponent, resultsComponent).flatten.nonEmpty) {
        val blobs = Seq(
          Some(
            HtmlAndClasses(
              1,
              fixturesComponent getOrElse Html("No upcoming fixtures"),
              if (fixturesComponent.isDefined) cssClasses else missingComponentClasses,
            ),
          ),
          Some(
            HtmlAndClasses(
              2,
              resultsComponent getOrElse Html("No recent results"),
              if (resultsComponent.isDefined) cssClasses else missingComponentClasses,
            ),
          ),
          maybeCompetitionAndGroup map {
            case CompetitionAndGroup(competition, group) =>
              HtmlAndClasses(
                3,
                tablesComponent(competition, group, competition.fullName, highlightTeamId = Some(teamId), false),
                cssClasses,
              )
          },
        ).flatten

        val layout = ContainerLayout.forHtmlBlobs(container.slices, blobs)

        val faciaContainer = FaciaContainer(
          index = 1,
          dataId = "fixtures-and-results",
          displayName = Some("Fixtures and results"),
          href = None,
          componentId = Some("fixtures-and-results"),
          container = Fixed(container),
          collectionEssentials = CollectionEssentials.empty,
          containerLayout = Some(layout),
          showDateHeader = false,
          showLatestUpdate = false,
          commercialOptions = ContainerCommercialOptions(omitMPU = false, adFree = request.isAdFree),
          customHeader = None,
          customClasses = Some(Seq("fc-container--tag")),
          hideToggle = true,
          showTimestamps = false,
          dateLinkPath = None,
          useShowMore = false,
          hasShowMoreEnabled = true,
          isThrasher = false,
          targetedTerritory = None,
        )
        Some(faciaContainer)
      } else None

    }).flatten
  }
}
