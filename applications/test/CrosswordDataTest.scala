package test

import model.{Entry, CrosswordData}
import org.scalatest._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.time.{Millis, Span}

@DoNotDiscover class CrosswordDataTest extends FreeSpec with ShouldMatchers with ConfiguredTestSuite with ScalaFutures {

  "CrosswordData" - {
    "fromCrossword should normalize separators for grouped entries" in {

      implicit val patienceConfig = PatienceConfig(timeout = scaled(Span(3000, Millis)), interval = scaled(Span(100, Millis)))
      val futureCrossword = controllers.CrosswordPageController.getCrossword("cryptic", 26666)(TestRequest("crosswords/cryptic/26666"))

      whenReady(futureCrossword) { result =>

        val maybeCrossword = result.content.flatMap(_.crossword)
        maybeCrossword shouldBe defined
        val crossword = CrosswordData.fromCrossword(maybeCrossword.get)

        crossword.entries.size should be (4)

        val entriesMap = crossword.entries.map(entry => (entry.id, entry)).toMap

        entriesMap.get("2-down").get.separatorLocations.get.get(",").get should be (Seq(4, 8))
        entriesMap.get("10-across").get.separatorLocations.get.get(",").get should be (Seq(3, 9))
        entriesMap.get("23-down").get.separatorLocations.get.get(",").get should be (Seq(4))
        entriesMap.get("21-across").get.separatorLocations.get.get(",").get should be (Seq(4, 7))
      }
    }

    "formatHumanNumber should format clue numbers correctly" in {
      Entry.formatHumanNumber("2") should be (Some("2"))
      Entry.formatHumanNumber("1,28") should be (Some("1, 28"))
      Entry.formatHumanNumber("10,15,20down") should be (Some("10, 15, 20 down"))
      Entry.formatHumanNumber("2,3,4,5across") should be (Some("2, 3, 4, 5 across"))
    }
  }
}
