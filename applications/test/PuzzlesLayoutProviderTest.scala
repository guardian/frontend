package test

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.{Content => ApiContent, Crossword, CrosswordType, SearchResponse}
import contentapi.ContentApiClient
import controllers.LocalJsonPuzzlesLayoutProvider
import model.dotcomrendering.{PuzzleContainer, PuzzleContent, PuzzleFilter, PuzzleItem, PuzzlesLayout}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.when
import org.mockito.invocation.InvocationOnMock
import org.mockito.stubbing.Answer
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.Json
import play.api.{Environment, Mode}

import java.io.{ByteArrayInputStream, File, InputStream}
import java.nio.charset.StandardCharsets
import scala.collection.mutable.ListBuffer
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Future}

class PuzzlesLayoutProviderTest extends AnyFlatSpec with Matchers with MockitoSugar {
  private implicit val executionContext: ExecutionContext = ExecutionContext.global

  "LocalJsonPuzzlesLayoutProvider" should "load the production layout from the classpath" in {
    val provider = new LocalJsonPuzzlesLayoutProvider(Environment.simple(), emptyContentApiClient())

    val layout = Await.result(provider.getLayout(), 5.seconds)

    layout.containers should not be empty
    layout.filters should not be empty
    layout.containers.flatMap(_.content.nestedContainers) should not be empty
    archives(layout) should not be empty
  }

  it should "close the resource stream after successful loading" in {
    val json = """{"containers":[],"filters":[]}"""
    val stream = new CloseTrackingInputStream(json)
    val provider = new LocalJsonPuzzlesLayoutProvider(environmentReturning(Some(stream)), emptyContentApiClient())

    Await.result(provider.getLayout(), 5.seconds) shouldBe PuzzlesLayout(Seq.empty, Seq.empty)
    stream.wasClosed shouldBe true
  }

  it should "fail clearly and close the stream when the blueprint is invalid" in {
    val stream = new CloseTrackingInputStream("""{"containers":[{"title":"incomplete"}]}""")
    val provider = new LocalJsonPuzzlesLayoutProvider(environmentReturning(Some(stream)), emptyContentApiClient())

    val error = the[IllegalArgumentException] thrownBy Await.result(provider.getLayout(), 5.seconds)

    error.getMessage should include("puzzles-layout.json")
    error.getMessage should include("is invalid")
    stream.wasClosed shouldBe true
  }

  it should "fail clearly and close the stream when the resource contains malformed JSON" in {
    val stream = new CloseTrackingInputStream("""{"containers": [""")
    val provider = new LocalJsonPuzzlesLayoutProvider(environmentReturning(Some(stream)), emptyContentApiClient())

    val error = the[IllegalArgumentException] thrownBy Await.result(provider.getLayout(), 5.seconds)

    error.getMessage should include("puzzles-layout.json")
    error.getMessage should include("could not be parsed as JSON")
    stream.wasClosed shouldBe true
  }

  it should "fail clearly when the classpath resource is missing" in {
    val provider = new LocalJsonPuzzlesLayoutProvider(environmentReturning(None), emptyContentApiClient())

    val error = the[IllegalStateException] thrownBy Await.result(provider.getLayout(), 5.seconds)

    error.getMessage should include("puzzles-layout.json")
    error.getMessage should include("was not found on the classpath")
  }

  it should "replace only URL and image fields after a successful lookup" in {
    val baseItem = PuzzleItem(
      title = "Editorial title",
      `type` = "crossword",
      set = "quick-cryptic",
      url = Some("/fallback"),
      image = Some("/fallback.svg"),
      slug = Some("editorial-slug"),
      index = Some(7),
      variant = Some("featured"),
      backgroundColour = Some("#abcdef"),
      filterId = Some("crosswords"),
    )
    val provider = providerFor(
      layoutWith(items = Seq(baseItem)),
      contentApiClient(Map("crosswords/series/quick-cryptic" -> Right(Some(CrosswordType.QuickCryptic -> 321)))),
    )

    val enrichedItem = firstItem(Await.result(provider.getLayout(), 5.seconds))

    enrichedItem shouldBe baseItem.copy(
      url = Some("/puzzles/crosswords/quick-cryptic/321"),
      image = Some("https://api.nextgen.guardianapps.co.uk/crosswords/quick-cryptic/321.svg"),
    )
  }

  it should "discover nested cards recursively and deduplicate lookups by set" in {
    val queries = ListBuffer.empty[SearchQuery]
    val nested = PuzzleContainer(
      title = "Nested",
      content = PuzzleContent(items = Seq(Seq(crossword("quick", "/nested"))), nestedContainers = Seq.empty),
    )
    val layout = layoutWith(
      items = Seq(crossword("quick", "/top"), crossword("quick", "/duplicate")),
      nestedContainers = Seq(nested),
    )
    val provider = providerFor(
      layout,
      contentApiClient(Map("crosswords/series/quick" -> Right(Some(CrosswordType.Quick -> 42))), queries),
    )

    val enriched = Await.result(provider.getLayout(), 5.seconds)

    queries should have size 1
    allItems(enriched).map(_.url).distinct shouldBe Seq(Some("/puzzles/crosswords/quick/42"))
  }

  it should "query the corresponding CAPI series tag for every supported crossword set" in {
    val setToSeries = Seq(
      "mini" -> "crosswords/series/mini-crossword",
      "weekend" -> "crosswords/series/weekend-crossword",
      "quick" -> "crosswords/series/quick",
      "cryptic" -> "crosswords/series/cryptic",
      "prize" -> "crosswords/series/prize",
      "sunday-quick" -> "crosswords/series/sunday-quick",
      "quick-cryptic" -> "crosswords/series/quick-cryptic",
      "everyman" -> "crosswords/series/everyman",
      "speedy" -> "crosswords/series/speedy",
      "quiptic" -> "crosswords/series/quiptic",
      "genius" -> "crosswords/series/genius",
      "special" -> "crosswords/series/special",
      "azed" -> "crosswords/series/azed",
    )
    val queries = ListBuffer.empty[SearchQuery]
    val provider = providerFor(
      layoutWith(items = setToSeries.map { case (set, _) => crossword(set) }),
      contentApiClient(setToSeries.map { case (_, tag) => tag -> Right(None) }.toMap, queries),
    )

    Await.result(provider.getLayout(), 5.seconds)

    queries.map(_.parameters("tag")).toSeq shouldBe setToSeries.map(_._2)
  }

  it should "request only the latest newspaper-edition crossword and its required fields" in {
    val queries = ListBuffer.empty[SearchQuery]
    val provider = providerFor(
      layoutWith(items = Seq(crossword("mini"))),
      contentApiClient(Map("crosswords/series/mini-crossword" -> Right(None)), queries),
    )

    Await.result(provider.getLayout(), 5.seconds)

    queries.toSeq should have size 1
    queries.head.parameters should contain allOf (
      "type" -> "crossword",
      "tag" -> "crosswords/series/mini-crossword",
      "use-date" -> "newspaper-edition",
      "order-by" -> "newest",
      "page-size" -> "1",
      "show-fields" -> "all",
    )
  }

  it should "leave unknown crossword sets unchanged without querying CAPI" in {
    val queries = ListBuffer.empty[SearchQuery]
    val baseItem = crossword("not-configured", "/base")
    val provider = providerFor(layoutWith(items = Seq(baseItem)), contentApiClient(Map.empty, queries))

    firstItem(Await.result(provider.getLayout(), 5.seconds)) shouldBe baseItem
    queries shouldBe empty
  }

  it should "exclude archive and non-crossword items from lookup and enrichment" in {
    val queries = ListBuffer.empty[SearchQuery]
    val latestCard = crossword("quick", "/latest-card")
    val archiveInItems = crossword("quick", "/archive-card").copy(variant = Some("archive-page"))
    val nonCrossword = PuzzleItem("Sudoku", "sudoku", "quick", url = Some("/sudoku"), image = Some("/sudoku.svg"))
    val archive = crossword("quick", "/archive")
    val layout = layoutWith(items = Seq(latestCard, archiveInItems, nonCrossword), archive = Some(archive))
    val provider = providerFor(
      layout,
      contentApiClient(Map("crosswords/series/quick" -> Right(Some(CrosswordType.Quick -> 99))), queries),
    )

    val result = Await.result(provider.getLayout(), 5.seconds)

    queries should have size 1
    allItems(result) should contain theSameElementsInOrderAs Seq(
      latestCard.copy(
        url = Some("/puzzles/crosswords/quick/99"),
        image = Some("https://api.nextgen.guardianapps.co.uk/crosswords/quick/99.svg"),
      ),
      archiveInItems,
      nonCrossword,
    )
    result.containers.head.content.archive shouldBe Some(archive)
  }

  it should "keep failed sets at their base values while enriching successful sets" in {
    val quick = crossword("quick", "/quick-base")
    val cryptic = crossword("cryptic", "/cryptic-base")
    val provider = providerFor(
      layoutWith(items = Seq(quick, cryptic)),
      contentApiClient(
        Map(
          "crosswords/series/quick" -> Right(Some(CrosswordType.Quick -> 100)),
          "crosswords/series/cryptic" -> Left(new RuntimeException("CAPI unavailable")),
        ),
      ),
    )

    val result = Await.result(provider.getLayout(), 5.seconds)

    allItems(result).find(_.set == "quick").flatMap(_.url) shouldBe Some("/puzzles/crosswords/quick/100")
    allItems(result).find(_.set == "cryptic") shouldBe Some(cryptic)
  }

  it should "return the complete base layout when all CAPI lookups fail" in {
    val baseLayout = layoutWith(items = Seq(crossword("quick", "/quick-base"), crossword("cryptic", "/cryptic-base")))
    val provider = providerFor(
      baseLayout,
      contentApiClient(
        Map(
          "crosswords/series/quick" -> Left(new RuntimeException("quick failed")),
          "crosswords/series/cryptic" -> Left(new RuntimeException("cryptic failed")),
        ),
      ),
    )

    Await.result(provider.getLayout(), 5.seconds) shouldBe baseLayout
  }

  private def crossword(set: String, url: String = "/base"): PuzzleItem =
    PuzzleItem(
      title = set,
      `type` = "crossword",
      set = set,
      url = Some(url),
      image = Some(s"$url.svg"),
      backgroundColour = Some("#f0f0f0"),
    )

  private def layoutWith(
      items: Seq[PuzzleItem],
      nestedContainers: Seq[PuzzleContainer] = Seq.empty,
      archive: Option[PuzzleItem] = None,
  ): PuzzlesLayout =
    PuzzlesLayout(
      containers = Seq(
        PuzzleContainer(
          title = "Test container",
          variant = Some("featured"),
          content = PuzzleContent(Seq(items), nestedContainers, archive),
          filterId = Some("crosswords"),
          desktopSpan = Some(12),
        ),
      ),
      filters = Seq(PuzzleFilter("crosswords", "Crosswords", Some("#f0f0f0"))),
    )

  private def providerFor(layout: PuzzlesLayout, client: ContentApiClient): LocalJsonPuzzlesLayoutProvider = {
    val stream = new CloseTrackingInputStream(Json.stringify(Json.toJson(layout)))
    new LocalJsonPuzzlesLayoutProvider(environmentReturning(Some(stream)), client)
  }

  private def emptyContentApiClient(): ContentApiClient = contentApiClient(Map.empty)

  private def contentApiClient(
      responses: Map[String, Either[Throwable, Option[(CrosswordType, Int)]]],
      capturedQueries: ListBuffer[SearchQuery] = ListBuffer.empty,
  ): ContentApiClient = {
    val client = mock[ContentApiClient]

    when(client.getResponse(any[SearchQuery])).thenAnswer(new Answer[Future[SearchResponse]] {
      override def answer(invocation: InvocationOnMock): Future[SearchResponse] = {
        val query = invocation.getArgument[SearchQuery](0)
        capturedQueries += query
        responses.getOrElse(query.parameters("tag"), Right(None)) match {
          case Left(error)    => Future.failed(error)
          case Right(content) => Future.successful(searchResponse(content))
        }
      }
    })

    client
  }

  private def searchResponse(crosswordData: Option[(CrosswordType, Int)]): SearchResponse = {
    val response = mock[SearchResponse]
    val results = crosswordData.toSeq.map { case (crosswordType, number) =>
      val crossword = mock[Crossword]
      when(crossword.`type`).thenReturn(crosswordType)
      when(crossword.number).thenReturn(number)

      val content = mock[ApiContent]
      when(content.crossword).thenReturn(Some(crossword))
      content
    }
    when(response.results).thenReturn(results)
    response
  }

  private def firstItem(layout: PuzzlesLayout): PuzzleItem = allItems(layout).head

  private def allItems(layout: PuzzlesLayout): Seq[PuzzleItem] =
    layout.containers.flatMap(allItems)

  private def allItems(container: PuzzleContainer): Seq[PuzzleItem] =
    container.content.items.flatten ++ container.content.nestedContainers.flatMap(allItems)

  private def archives(layout: PuzzlesLayout): Seq[PuzzleItem] =
    layout.containers.flatMap(container =>
      container.content.archive.toSeq ++
        container.content.nestedContainers.flatMap(nested => nested.content.archive.toSeq),
    )

  private def environmentReturning(stream: Option[InputStream]): Environment = {
    val classLoader = new ClassLoader(null) {
      override def getResourceAsStream(name: String): InputStream = stream.orNull
    }
    Environment(new File("."), classLoader, Mode.Test)
  }

  private class CloseTrackingInputStream(contents: String)
      extends ByteArrayInputStream(contents.getBytes(StandardCharsets.UTF_8)) {
    var wasClosed = false

    override def close(): Unit = {
      wasClosed = true
      super.close()
    }
  }
}
