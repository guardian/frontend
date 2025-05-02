package model.dotcomrendering

import com.gu.contentapi.client.model.v1.{CapiDateTime, Crossword, CrosswordType, CrosswordDimensions, CrosswordEntry}
import model.dotcomrendering.pageElements.EditionsCrosswordRenderingDataModel
import org.mockito.Mockito.when
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import org.joda.time.DateTime

class EditionsCrosswordRenderingDataModelTest extends AnyFlatSpec with Matchers with MockitoSugar {
  val mockEntry = CrosswordEntry(
    id = "mockId",
    solution = Some("Mock solution"),
  )

  val mockCrossword = Crossword(
    name = "Mock name",
    `type` = CrosswordType.Quick,
    number = 1,
    date = CapiDateTime(DateTime.now().getMillis(), "date"),
    dimensions = CrosswordDimensions(1, 1),
    entries = Seq(mockEntry, mockEntry),
    solutionAvailable = true,
    hasNumbers = false,
    randomCluesOrdering = false,
  )

  "apply" should "provide solutions when 'dateSolutionAvailable' is in the past" in {
    val crossword = mockCrossword.copy(
      solutionAvailable = true,
      dateSolutionAvailable = Some(CapiDateTime(DateTime.now().minusDays(1).getMillis(), "date")),
    )

    val crosswords =
      EditionsCrosswordRenderingDataModel(Seq(crossword, crossword),Nil).crosswords.toSeq

    crosswords(0).entries(0).solution shouldBe Some("Mock solution")
    crosswords(0).entries(1).solution shouldBe Some("Mock solution")
    crosswords(1).entries(0).solution shouldBe Some("Mock solution")
    crosswords(1).entries(1).solution shouldBe Some("Mock solution")
  }

  "apply" should "provide solutions when 'dateSolutionAvailable' is 'None' and solutionAvailable is 'true'" in {
    val crossword = mockCrossword.copy(
      solutionAvailable = true,
      dateSolutionAvailable = None,
    )

    val crosswords =
      EditionsCrosswordRenderingDataModel(Seq(crossword, crossword),Nil).crosswords.toSeq

    crosswords(0).entries(0).solution shouldBe Some("Mock solution")
    crosswords(0).entries(1).solution shouldBe Some("Mock solution")
    crosswords(1).entries(0).solution shouldBe Some("Mock solution")
    crosswords(1).entries(1).solution shouldBe Some("Mock solution")
  }

  "apply" should "not provide solutions when 'dateSolutionAvailable' is in the future" in {
    val crossword = mockCrossword.copy(
      solutionAvailable = true,
      dateSolutionAvailable = Some(CapiDateTime(DateTime.now().plusDays(1).getMillis(), "date")),
    )

    val crosswords =
      EditionsCrosswordRenderingDataModel(Seq(crossword, crossword),Nil).crosswords.toSeq

    crosswords(0).entries(0).solution shouldBe None
    crosswords(0).entries(1).solution shouldBe None
    crosswords(1).entries(0).solution shouldBe None
    crosswords(1).entries(1).solution shouldBe None
  }

  "apply" should "not provide solutions when 'dateSolutionAvailable' is 'None' and solutionAvailable is 'false'" in {
    val crossword = mockCrossword.copy(
      solutionAvailable = false,
      dateSolutionAvailable = None,
    )

    val crosswords =
      EditionsCrosswordRenderingDataModel(Seq(crossword, crossword),Nil).crosswords.toSeq

    crosswords(0).entries(0).solution shouldBe None
    crosswords(0).entries(1).solution shouldBe None
    crosswords(1).entries(0).solution shouldBe None
    crosswords(1).entries(1).solution shouldBe None
  }
}
