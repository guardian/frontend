package model.dotcomrendering

import com.gu.contentapi.client.model.v1.{CrosswordEntry, CrosswordPosition => CapiCrosswordPosition}
import model.dotcomrendering.pageElements.CrosswordPosition
import model.dotcomrendering.pageElements.EditionsCrosswordEntry
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar

class EditionsCrosswordRenderingDataModelTest extends AnyFlatSpec with Matchers with MockitoSugar {

  val mockCapiEntryWithSolution = CrosswordEntry(
    id = "seven-down",
    number = Some(7),
    humanNumber = Some("7"),
    direction = Some("down"),
    length = Some(4),
    clue = Some("Mock clue"),
    group = Some(Seq("seven-down")),
    position = Some(CapiCrosswordPosition(x = 2, y = 0)),
    separatorLocations = Some(Map("," -> Seq(2))),
    solution = Some("ANSWER"),
  )

  val mockCapiEntryWithoutSolution = mockCapiEntryWithSolution.copy(solution = None)

  "EditionsCrosswordEntry.fromCrosswordEntry" should "correctly map all fields when solution is provided" in {
    val shipSolutions = true
    val resultEntry = EditionsCrosswordEntry.fromCrosswordEntry(mockCapiEntryWithSolution, shipSolutions)

    resultEntry.id shouldBe "seven-down"
    resultEntry.number shouldBe 7
    resultEntry.humanNumber shouldBe "7"
    resultEntry.direction shouldBe "down"
    resultEntry.length shouldBe 4
    resultEntry.clue shouldBe "Mock clue"
    resultEntry.group shouldBe Seq("seven-down")
    resultEntry.position shouldBe CrosswordPosition(x = 2, y = 0)
    resultEntry.separatorLocations shouldBe Some(Map("," -> Seq(2)))
    resultEntry.solution shouldBe Some("ANSWER") // Solution included
  }

  it should "correctly map all fields when solution is NOT provided (input has None)" in {
    val shipSolutions = true
    val resultEntry = EditionsCrosswordEntry.fromCrosswordEntry(mockCapiEntryWithoutSolution, shipSolutions)

    resultEntry.id shouldBe "seven-down"
    resultEntry.number shouldBe 7
    resultEntry.position shouldBe CrosswordPosition(x = 2, y = 0)
    resultEntry.separatorLocations shouldBe Some(Map("," -> Seq(2)))
    resultEntry.solution shouldBe None
  }

  it should "correctly map fields and explicitly exclude solution when shipSolutions is false" in {
    val shipSolutions = false
    val resultEntry =
      EditionsCrosswordEntry.fromCrosswordEntry(
        mockCapiEntryWithSolution,
        shipSolutions,
      ) // Use entry *with* solution

    resultEntry.id shouldBe "seven-down"
    resultEntry.number shouldBe 7
    resultEntry.position shouldBe CrosswordPosition(x = 2, y = 0)
    resultEntry.separatorLocations shouldBe Some(Map("," -> Seq(2)))
    resultEntry.solution shouldBe None
  }

  it should "handle missing optional CAPI fields gracefully" in {
    val minimalCapiEntry = CrosswordEntry(id = "one-across")
    val shipSolutions = true
    val resultEntry = EditionsCrosswordEntry.fromCrosswordEntry(minimalCapiEntry, shipSolutions)

    resultEntry.id shouldBe "one-across"
    resultEntry.number shouldBe 0
    resultEntry.humanNumber shouldBe ""
    resultEntry.clue shouldBe ""
    resultEntry.direction shouldBe ""
    resultEntry.length shouldBe 0
    resultEntry.group shouldBe Seq.empty
    resultEntry.position shouldBe CrosswordPosition(x = 0, y = 0)
    resultEntry.separatorLocations shouldBe None
    resultEntry.solution shouldBe None
  }
}
