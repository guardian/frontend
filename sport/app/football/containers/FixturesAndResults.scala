package football.containers

import com.gu.facia.client.models.CollectionConfig
import feed.Competitions
import implicits.Football
import layout.{CollectionEssentials, FaciaContainer}
import model.{TeamMap, Snap}
import org.joda.time.DateTime
import services.CollectionConfigWithId
import slices.{FixedContainers, Fixed}

import scalaz.syntax.std.boolean._

object FixturesAndResults extends Football {
  private def makeJsonSnap(id: String, snapTitle: String, link: String, endpoint: String, cssClass: String) = new Snap(
    id,
    Nil,
    DateTime.now(),
    None
  ) {
    override lazy val url: String = link
    override lazy val href: Option[String] = Some(link)
    override lazy val snapType: Option[String] = Some("json.html")
    override lazy val snapUri: Option[String] = Some(endpoint)
    override lazy val headline: String = snapTitle
    override lazy val snapCss: Option[String] = Some(cssClass)
  }

  def makeContainer(tagId: String) = {
    val competitions = Competitions()

    for {
      teamId <- TeamMap.findTeamIdByUrlName(tagId)
    } yield {
      val relevantMatches = competitions.matches.filter({ theMatch =>
        theMatch.homeTeam.id == teamId || theMatch.awayTeam.id == teamId
      }).toList

      val fixtureExists = relevantMatches.exists(_.isFixture)
      val resultExists = relevantMatches.exists(_.isResult)
      val leagueTableExists = competitions.mostPertinentCompetitionForTeam(teamId).isDefined

      val snaps = Seq(
        fixtureExists option makeJsonSnap(
          "fixtures",
          "Fixtures",
          s"/$tagId/fixtures",
          s"/$tagId/fixtures.json",
          "football"
        ),
        resultExists option makeJsonSnap(
          "results",
          "Results",
          s"/$tagId/results",
          s"/$tagId/results.json",
          "football"
        ),
        leagueTableExists option makeJsonSnap(
          "table",
          "Table",
          s"/football/tables",
          s"/$tagId/team-table.json",
          "football"
        )
      ).flatten

      FaciaContainer(
        1,
        Fixed(FixedContainers.footballTeamFixtures),
        CollectionConfigWithId(
          "football-team-fixtures",
          CollectionConfig.emptyConfig.copy(displayName = Some("Fixtures and results"))
        ),
        CollectionEssentials.fromTrails(snaps)
      ).copy(
        customClasses = Some(Seq("fc-container--tag")),
        hideToggle = true
      )
    }
  }
}
