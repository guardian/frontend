package football.containers

import feed.Competitions
import football.model.{TeamResultsList, TeamFixturesList}
import implicits.Football
import layout._
import model.{Group, Competition, Table, TeamMap}
import play.api.mvc.RequestHeader
import slices.{FixedContainers, Fixed}
import football.views.html.matchList.matchesComponent
import football.views.html.tablesList.tablesComponent

import scalaz.syntax.std.boolean._

object CompetitionAndGroup {
  def bestForTeam(teamId: String) = {
    for {
      competition <- Competitions().mostPertinentCompetitionForTeam(teamId)
      table = Table(competition)
      group <- table.groups.find(_.entries.exists(_.team.id == teamId)) orElse
        table.groups.headOption
    } yield CompetitionAndGroup(competition, group.copy(entries = group.entries.take(10)))
  }
}

case class CompetitionAndGroup(competition: Competition, group: Group)

object FixturesAndResults extends Football {
  def makeContainer(tagId: String)(implicit request: RequestHeader) = {
    val competitions = Competitions()

    for {
      teamId <- TeamMap.findTeamIdByUrlName(tagId)
    } yield {
      val relevantMatches = competitions.matches.filter({ theMatch =>
        theMatch.homeTeam.id == teamId || theMatch.awayTeam.id == teamId
      }).toList

      val container = FixedContainers.footballTeamFixtures

      val fixtureExists = relevantMatches.exists(_.isFixture)
      val resultExists = relevantMatches.exists(_.isResult)
      val leagueTableExists = competitions.mostPertinentCompetitionForTeam(teamId).isDefined
      val cssClasses = Seq("facia-snap--football", "facia-snap-embed")

      val maybeCompetitionAndGroup = CompetitionAndGroup.bestForTeam(teamId).filter(_ => leagueTableExists)

      val layout = ContainerLayout.forHtmlBlobs(container.slices, Seq(
        fixtureExists option HtmlAndClasses(
          1,
          matchesComponent(TeamFixturesList.forTeamId(teamId)),
          cssClasses
        ),
        resultExists option HtmlAndClasses(
          2,
          matchesComponent(TeamResultsList.forTeamId(teamId)),
          cssClasses
        ),
        maybeCompetitionAndGroup map { case CompetitionAndGroup(competition, group) =>
          HtmlAndClasses(
            3,
            tablesComponent(competition, group, highlightTeamId = Some(teamId), false),
            cssClasses
          )
        }
      ).flatten)

      FaciaContainer(
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
        commercialOptions = ContainerCommercialOptions.empty,
        customHeader = None,
        customClasses = Some(Seq("fc-container--tag")),
        hideToggle = true,
        showTimestamps = false,
        dateLinkPath = None
      )
    }
  }
}
