//package model.dotcomrendering
//
//import com.gu.contentapi.client.model.v1.{
//  CapiDateTime,
//  Content,
//  ContentType,
//  Crossword,
//  CrosswordDimensions,
//  CrosswordEntry,
//  CrosswordType,
//}
//import model.CrosswordData
//import model.dotcomrendering.pageElements.EditionsCrosswordRenderingDataModel
//import org.joda.time.DateTime
//import org.scalatest.flatspec.AnyFlatSpec
//import org.scalatest.matchers.should.Matchers
//import org.scalatestplus.mockito.MockitoSugar
//
//class EditionsCrosswordRenderingDataModelTest extends AnyFlatSpec with Matchers with MockitoSugar {
//
//  val nowMillis = DateTime.now().getMillis()
//  val nowCapi = CapiDateTime(nowMillis, "date")
//
//  val mockEntry = CrosswordEntry(
//    id = "mockId-1",
//    number = Some(1),
//    humanNumber = Some("1"),
//    clue = Some("Mock clue"),
//    direction = Some("across"),
//    length = Some(4),
//    group = Some(Seq("mockId-1")),
//    position = None,
//    separatorLocations = None,
//    solution = Some("MOCK"),
//  )
//
//  val baseMockCapiCrossword = Crossword(
//    name = "Mock name",
//    `type` = CrosswordType.Quick,
//    number = 1,
//    date = nowCapi,
//    dimensions = CrosswordDimensions(cols = 10, rows = 10),
//    entries = Seq(mockEntry, mockEntry.copy(id = "mockId-2", solution = Some("SOLN"))),
//    solutionAvailable = true,
//    dateSolutionAvailable = None,
//    hasNumbers = true,
//    pdf = None,
//    instructions = None,
//    creator = None,
//    randomCluesOrdering = false,
//  )
//
//  def createMockContent(crossword: Crossword): Content = Content(
//    id = "crosswords/mock/123",
//    `type` = ContentType.Crossword,
//    webTitle = "Mock Crossword Content",
//    webUrl = "http://mock.url/crosswords/mock/123",
//    apiUrl = "http://mock.api/crosswords/mock/123",
//    elements = None,
//    tags = Nil,
//    references = Nil,
//    crossword = Some(crossword),
//    webPublicationDate = Some(nowCapi),
//  )
//
//  def convertToCrosswordData(crossword: Crossword): CrosswordData = {
//    val content = createMockContent(crossword)
//    CrosswordData.fromCrossword(crossword, content)
//  }
//
//  "EditionsCrosswordRenderingDataModel" should "contain CrosswordData with solutions when 'dateSolutionAvailable' is in the past" in {
//    val capiCrossword = baseMockCapiCrossword.copy(
//      solutionAvailable = true,
//      dateSolutionAvailable = Some(CapiDateTime(DateTime.now().minusDays(1).getMillis(), "date")),
//    )
//    val crosswordData = convertToCrosswordData(capiCrossword)
//
//    val model = EditionsCrosswordRenderingDataModel(Seq(crosswordData, crosswordData))
//    val crosswords = model.crosswords.toSeq
//
//    crosswords should have size 2
//    crosswords.head.entries should have size 2
//
//    crosswords(0).entries(0).solution shouldBe Some("MOCK")
//    crosswords(0).entries(1).solution shouldBe Some("SOLN")
//    crosswords(1).entries(0).solution shouldBe Some("MOCK")
//    crosswords(1).entries(1).solution shouldBe Some("SOLN")
//  }
//
//  it should "contain CrosswordData with solutions when 'dateSolutionAvailable' is None and solutionAvailable is true" in {
//    val capiCrossword = baseMockCapiCrossword.copy(
//      solutionAvailable = true,
//      dateSolutionAvailable = None,
//    )
//    val crosswordData = convertToCrosswordData(capiCrossword)
//    val model = EditionsCrosswordRenderingDataModel(Seq(crosswordData, crosswordData))
//    val crosswords = model.crosswords.toSeq
//
//    crosswords(0).entries(0).solution shouldBe Some("MOCK")
//    crosswords(0).entries(1).solution shouldBe Some("SOLN")
//    crosswords(1).entries(0).solution shouldBe Some("MOCK")
//    crosswords(1).entries(1).solution shouldBe Some("SOLN")
//  }
//
//  it should "contain CrosswordData without solutions when 'dateSolutionAvailable' is in the future" in {
//    val capiCrossword = baseMockCapiCrossword.copy(
//      solutionAvailable = true,
//      dateSolutionAvailable = Some(CapiDateTime(DateTime.now().plusDays(1).getMillis(), "date")),
//    )
//    val crosswordData = convertToCrosswordData(capiCrossword)
//    val model = EditionsCrosswordRenderingDataModel(Seq(crosswordData, crosswordData))
//    val crosswords = model.crosswords.toSeq
//
//    crosswords(0).entries(0).solution shouldBe None
//    crosswords(0).entries(1).solution shouldBe None
//    crosswords(1).entries(0).solution shouldBe None
//    crosswords(1).entries(1).solution shouldBe None
//  }
//
//  it should "contain CrosswordData without solutions when 'dateSolutionAvailable' is None and solutionAvailable is false" in {
//    val capiCrossword = baseMockCapiCrossword.copy(
//      solutionAvailable = false,
//      dateSolutionAvailable = None,
//    )
//    val crosswordData = convertToCrosswordData(capiCrossword)
//    val model = EditionsCrosswordRenderingDataModel(Seq(crosswordData, crosswordData))
//    val crosswords = model.crosswords.toSeq
//
//    crosswords(0).entries(0).solution shouldBe None
//    crosswords(0).entries(1).solution shouldBe None
//    crosswords(1).entries(0).solution shouldBe None
//    crosswords(1).entries(1).solution shouldBe None
//  }
//}
