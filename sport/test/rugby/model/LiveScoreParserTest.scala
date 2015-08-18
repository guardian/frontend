package rugby.model

import org.scalatest._
import test.ConfiguredTestSuite
import scala.io.Source

@DoNotDiscover class LiveScoreParserTest extends FreeSpec with ShouldMatchers with ConfiguredTestSuite {

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

      val futureResult = liveScores.find(_.id == "2873").get
      futureResult.homeTeam.name should be("Argentina")
      futureResult.homeTeam.score should be(None)
      futureResult.awayTeam.name should be("South Africa")
      futureResult.awayTeam.score should be(None)
    }
  }
}
