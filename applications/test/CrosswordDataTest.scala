package test

import org.scalatest._
import play.api.libs.json.Json
import crosswords._

import com.gu.contentapi.client.model._

import scala.io.Source

@DoNotDiscover class CrosswordDataTest extends FreeSpec with ShouldMatchers with ConfiguredTestSuite {

  "CrosswordData" - {
    "fromCrossword should normalize separators for grouped entries" in {
      val crosswordData = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("crosswords/cryptic-crossword.json")).mkString
      val crosswordJson = Json.parse(crosswordData)

      implicit val creatorReads = Json.reads[CrosswordCreator]
      implicit val positionReads = Json.reads[CrosswordPosition]
      implicit val dimensionsReads = Json.reads[CrosswordDimensions]
      implicit val entryReads = Json.reads[CrosswordEntry]
      implicit val reads = Json.reads[Crossword]

      val capiCrossword = crosswordJson.as[Crossword]
      val crossword = CrosswordData.fromCrossword(capiCrossword)
      
      crossword.entries.size should be (4)

      val entriesMap = crossword.entries.map(entry => (entry.id, entry)).toMap

      entriesMap.get("2-down").get.separatorLocations.get.get(",").get should be (Seq(4, 8))
      entriesMap.get("10-across").get.separatorLocations.get.get(",").get should be (Seq(3, 9))
      entriesMap.get("23-down").get.separatorLocations.get.get(",").get should be (Seq(4))
      entriesMap.get("21-across").get.separatorLocations.get.get(",").get should be (Seq(4, 7))
    }

    "formatHumanNumber should format clue numbers correctly" in {
      crosswords.Entry.formatHumanNumber("2") should be (Some("2"))
      crosswords.Entry.formatHumanNumber("1,28") should be (Some("1, 28"))
      crosswords.Entry.formatHumanNumber("10,15,20down") should be (Some("10, 15, 20 down"))
      crosswords.Entry.formatHumanNumber("2,3,4,5across") should be (Some("2, 3, 4, 5 across"))
    }
  }
}
