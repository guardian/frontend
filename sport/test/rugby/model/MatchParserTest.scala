package rugby.model

import org.scalatest._
import test.ConfiguredTestSuite

import scala.io.Source

@DoNotDiscover class MatchParserTest extends FreeSpec with ShouldMatchers with ConfiguredTestSuite {

  "Parser" - {
    "should parse rugby live scores correctly" in {
      val liveScoreData = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/live-scores.xml")).mkString

      val liveScores = rugby.feed.Parser.parseLiveScores(liveScoreData)

      liveScores.size should be(4)

      val firstResult = liveScores.find(_.id == "2872").get
      firstResult.homeTeam.name should be("New Zealand")
      firstResult.homeTeam.score should be(Some(41))
      firstResult.awayTeam.name should be("Australia")
      firstResult.awayTeam.score should be(Some(13))
      firstResult.date should be(new org.joda.time.DateTime(2015, 8, 15, 0, 0))
      firstResult.venue should be (None)

      val futureResult = liveScores.find(_.id == "2873").get
      futureResult.homeTeam.name should be("Argentina")
      futureResult.homeTeam.score should be(None)
      futureResult.awayTeam.name should be("South Africa")
      futureResult.awayTeam.score should be(None)
      futureResult.venue should be (None)
    }

    "should parse rugby results correctly" in {
      val fixturesAndResultsData = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/fixtures-and-results.xml")).mkString

      val fixturesAndResults = rugby.feed.Parser.parseFixturesAndResults(fixturesAndResultsData)

      fixturesAndResults.size should be(26)

      val firstResult = fixturesAndResults.find(_.id == "7491").get
      firstResult.homeTeam.name should be ("Samoa")
      firstResult.homeTeam.score should be(Some(16))
      firstResult.awayTeam.name should be("New Zealand")
      firstResult.awayTeam.score should be(Some(25))
      firstResult.date should be(new org.joda.time.DateTime(2015, 7, 8, 0, 0))
      firstResult.venue should be (Some("Apia Park"))
      firstResult.competitionName should be ("International")


      val futureResult = fixturesAndResults.find(_.id == "7528").get
      futureResult.homeTeam.name should be("Ireland")
      futureResult.homeTeam.score should be(None)
      futureResult.awayTeam.name should be("Wales")
      futureResult.awayTeam.score should be(None)
      futureResult.venue should be (Some("Aviva Stadium"))
      futureResult.competitionName should be ("International")
    }

    "should parse live events stats correctly" in {
      val liveEventsStatsData = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("rugby/feed/live-events-stats.xml")).mkString

      val scoreEvents = rugby.feed.Parser.parseLiveEventsStatsToGetScoreEvents(liveEventsStatsData)

      scoreEvents.size should be(9)

      val tryScoreEvents = scoreEvents.filter(_.`type` == ScoreType.`Try`)

      tryScoreEvents.size should be(4)

      val topTryScorer: Seq[ScoreEvent] = tryScoreEvents.filter(_.player.id == "19083")
      topTryScorer.size should be(2)
      topTryScorer.head.player.name should be("Anthony Watson")
      topTryScorer.head.minute should be("10")

      topTryScorer.head.player.team.id should be("550")
      topTryScorer.head.player.team.name should be("England")
    }
  }
}
