package model.dotcomrendering

import com.gu.contentapi.client.model.v1.{Content, Crossword, CrosswordType}
import model.dotcomrendering.pageElements.EditionsCrosswordRenderingDataModel
import org.mockito.Mockito.when
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar

class EditionsCrosswordRenderingDataModelTest extends AnyFlatSpec with Matchers with MockitoSugar {
  "fromContent" should "get the first of each type of crossword" in {
    val mockQuickCrossword = mock[Crossword]
    when(mockQuickCrossword.`type`) thenReturn CrosswordType.Quick
    val mockQuickCrosswordContent = mock[Content]
    when(mockQuickCrosswordContent.crossword) thenReturn Some(mockQuickCrossword)

    val mockCrypticCrossword = mock[Crossword]
    when(mockCrypticCrossword.`type`) thenReturn CrosswordType.Cryptic
    val mockCrypticCrosswordContent = mock[Content]
    when(mockCrypticCrosswordContent.crossword) thenReturn Some(mockCrypticCrossword)

    val mockCrosswords = Seq(
      mockQuickCrosswordContent,
      mockQuickCrosswordContent,
      mockQuickCrosswordContent,
      mockCrypticCrosswordContent,
      mockCrypticCrosswordContent,
    )

    val crosswords =
      EditionsCrosswordRenderingDataModel
        .fromContent(mockCrosswords)
        .crosswords
        .toSeq

    crosswords.length shouldEqual 2
    crosswords(0).`type` shouldBe CrosswordType.Quick
    crosswords(1).`type` shouldBe CrosswordType.Cryptic
  }
}
