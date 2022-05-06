package test

import controllers.CrosswordPageController
import model.{CrosswordData, Entry}
import org.joda.time.DateTime
import org.scalatest._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.time.{Millis, Span}

@DoNotDiscover class CrosswordDataTest
    extends AnyFreeSpec
    with Matchers
    with ConfiguredTestSuite
    with ScalaFutures
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  "CrosswordData" - {

    lazy val crosswordPageController =
      new CrosswordPageController(testContentApiClient, play.api.test.Helpers.stubControllerComponents())

    "fromCrossword should normalize separators for grouped entries" in {

      implicit val patienceConfig = PatienceConfig(timeout = Span(3000, Millis), interval = Span(100, Millis))
      val futureCrossword =
        crosswordPageController.getCrossword("cryptic", 26666)(TestRequest("crosswords/cryptic/26666"))

      whenReady(futureCrossword) { result =>
        val maybeCrossword = result.content.flatMap(_.crossword)
        maybeCrossword shouldBe defined
        val crossword = CrosswordData.fromCrossword(maybeCrossword.get, result.content.get)

        crossword.entries.size should be(30)

        val entriesMap = crossword.entries.map(entry => (entry.id, entry)).toMap

        entriesMap("2-down").separatorLocations.get(",") should be(Seq(4, 8))
        entriesMap("10-across").separatorLocations.get(",") should be(Seq(3, 9))
        entriesMap("23-down").separatorLocations.get(",") should be(Seq(4))
        entriesMap("21-across").separatorLocations.get(",") should be(Seq(4, 7))
      }
    }

    "formatHumanNumber should format clue numbers correctly" in {
      Entry.formatHumanNumber("2") should be(Some("2"))
      Entry.formatHumanNumber("1,28") should be(Some("1, 28"))
      Entry.formatHumanNumber("10,15,20down") should be(Some("10, 15, 20 down"))
      Entry.formatHumanNumber("2,3,4,5across") should be(Some("2, 3, 4, 5 across"))
      Entry.formatHumanNumber("2,24across,16") should be(Some("2, 24 across, 16"))
      Entry.formatHumanNumber("3,down,10,12") should be(None) // Missing number in second clue
      Entry.formatHumanNumber("this,is,not,well,formed,clues") should be(None)
    }

    "fromCrossword should populate solutionAvailable field always and dateSolutionAvailable field if it exists" in {

      implicit val patienceConfig = PatienceConfig(timeout = Span(3000, Millis), interval = Span(100, Millis))
      val futureCrosswordWithDateSolutionAvailable =
        crosswordPageController.getCrossword("prize", 26806)(TestRequest("crosswords/prize/26806"))
      whenReady(futureCrosswordWithDateSolutionAvailable) { result =>
        val maybeCrossword = result.content.flatMap(_.crossword)
        maybeCrossword shouldBe defined
        val crossword = CrosswordData.fromCrossword(maybeCrossword.get, result.content.get)
        crossword.solutionAvailable should be(true)
        crossword.dateSolutionAvailable should be(Some(new DateTime(2016, 2, 20, 0, 0, 0)))
      }
    }

  }
}
