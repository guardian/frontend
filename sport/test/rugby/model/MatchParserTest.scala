package rugby.model

import org.scalatest._
import rugby.feed.WarmupWorldCup2015
import test.ConfiguredTestSuite

import scala.io.Source

@DoNotDiscover class MatchParserTest extends FreeSpec with ShouldMatchers with ConfiguredTestSuite {

  "Parser" - {
    "should parse rugby live scores correctly" in {
      val liveScoreData = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/live-scores.xml")).mkString

      val liveScores = rugby.feed.Parser.parseLiveScores(liveScoreData, WarmupWorldCup2015)

      liveScores.size should be(4)

      val firstResult = liveScores.find(_.id == "2872").get
      firstResult.homeTeam.name should be("New Zealand")
      firstResult.homeTeam.score should be(Some(41))
      firstResult.awayTeam.name should be("Australia")
      firstResult.awayTeam.score should be(Some(13))
      firstResult.date should be(new org.joda.time.DateTime(2015, 8, 15, 8, 35))
      firstResult.venue should be (None)
      firstResult.stage should be (Stage.Group)

      val futureResult = liveScores.find(_.id == "2873").get
      futureResult.homeTeam.name should be("Argentina")
      futureResult.homeTeam.score should be(None)
      futureResult.awayTeam.name should be("South Africa")
      futureResult.awayTeam.score should be(None)
      futureResult.venue should be (None)
      futureResult.stage should be (Stage.Group)
    }

    "should parse rugby results correctly" in {
      val fixturesAndResultsData = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/fixtures-and-results.xml")).mkString

      val fixturesAndResults = rugby.feed.Parser.parseFixturesAndResults(fixturesAndResultsData, WarmupWorldCup2015)

      fixturesAndResults.size should be(26)

      val firstResult = fixturesAndResults.find(_.id == "7491").get
      firstResult.homeTeam.name should be ("Samoa")
      firstResult.homeTeam.score should be(Some(16))
      firstResult.awayTeam.name should be("New Zealand")
      firstResult.awayTeam.score should be(Some(25))
      firstResult.date should be(new org.joda.time.DateTime(2015, 7, 8, 3, 0))
      firstResult.venue should be (Some("Apia Park"))
      firstResult.competitionName should be ("International")
      firstResult.stage should be(Stage.Group)


      val futureResult = fixturesAndResults.find(_.id == "7528").get
      futureResult.homeTeam.name should be("Ireland")
      futureResult.homeTeam.score should be(None)
      futureResult.awayTeam.name should be("Wales")
      futureResult.awayTeam.score should be(None)
      futureResult.venue should be (Some("Aviva Stadium"))
      futureResult.competitionName should be ("International")
      futureResult.stage should be(Stage.Group)
    }

    "should parse live events stats correctly" in {
      val liveEventsStatsData = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/live-events-stats.xml")).mkString

      val scoreEvents = rugby.feed.Parser.parseLiveEventsStatsToGetScoreEvents(liveEventsStatsData)

      scoreEvents.size should be(10)

      val tryScoreEvents = scoreEvents.filter(_.`type` == ScoreType.`Try`)

      tryScoreEvents.size should be(5)

      val topTryScorer: Seq[ScoreEvent] = tryScoreEvents.filter(_.player.id == "19083")
      topTryScorer.size should be(2)
      topTryScorer.head.player.name should be("Anthony Watson")
      topTryScorer.head.minute should be("10")

      topTryScorer.head.player.team.id should be("550")
      topTryScorer.head.player.team.name should be("England")

      val penaltyTry = tryScoreEvents.filter(_.player.id == "0")
      penaltyTry.size should be (1)
      penaltyTry.head.player.name should be("Penalty")
      penaltyTry.head.minute should be ("12")
      penaltyTry.head.player.team.name should be("England")
    }

     "should parse team stats correctly" in {
      val liveEventsStatsData = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/live-events-stats.xml")).mkString

      val matchStat = rugby.feed.Parser.parseLiveEventsStatsToGetMatchStat(liveEventsStatsData)

      matchStat.teams.size should be(2)
      matchStat.teams.head.name should be("England")
      matchStat.teams.last.name should be("France")

      val england = matchStat.teams.head

      england.id should be(29754)
      england.possession should be(0.49F)
      england.territory should be(0.50)
      england.carries_metres should be(323)
      england.tackles should be(103)
      england.missed_tackles should be(25)
      england.tackle_success should be(0.80F)
      england.turnover_won should be(8)
      england.turnovers_conceded should be(13)
      england.lineouts_won should be(13)
      england.lineouts_lost should be(3)
      england.mauls_won should be(4)
      england.mauls_lost should be(1)
      england.mauls_total should be(5)
      england.penalties_conceded should be(9)
      england.penalty_conceded_dissent should be(0)
      england.penalty_conceded_delib_knock_on should be(0)
      england.penalty_conceded_early_tackle should be(0)
      england.penalty_conceded_handling_in_ruck should be(0)
      england.penalty_conceded_high_tackle should be(0)
      england.penalty_conceded_lineout_offence should be(0)
      england.penalty_conceded_collapsing_maul should be(0)
      england.penalty_conceded_collapsing_offence should be(0)
      england.penalty_conceded_obstruction should be(0)
      england.penalty_conceded_offside should be(0)
      england.penalty_conceded_opp_half should be(6)
      england.penalty_conceded_own_half should be(4)
      england.penalty_conceded_other should be(9)
      england.penalty_conceded_scrum_offence should be(0)
      england.penalty_conceded_stamping should be(0)
      england.penalty_conceded_wrong_side should be(0)

      england.rucks_won should be(65)
      england.rucks_lost should be(3)
      england.rucks_total should be(68)

      england.scrums_won should be(5)
      england.scrums_lost should be(2)
      england.scrums_total should be(7)

      val france = matchStat.teams.last
    }

    "should parse group tables correctly" in {
      val tablesData = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/group-tables.xml")).mkString
      val tables = rugby.feed.Parser.parseGroupTables(tablesData)

      tables.size should be(4)
      tables.head.name should be("Pool A")
      val fiji = tables.head.teams.head
      fiji.name should be("Fiji")
      fiji.rank should be(1)
      fiji.played should be(2)
      fiji.won should be(1)
      fiji.drawn should be(1)
      fiji.lost should be(0)
      fiji.points should be(4)
      fiji.pointsdiff should be(75)

      val wales = tables.head.teams(1)
      wales.name should be("Wales")
      wales.rank should be(2)
      wales.pointsdiff should be(-25)

    }
  }
}
