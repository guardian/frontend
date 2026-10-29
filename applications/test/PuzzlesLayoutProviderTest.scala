package test

import controllers.{LocalJsonPuzzlesLayoutProvider, PuzzlesApiItem, PuzzlesArchiveApi}
import model.dotcomrendering.{
  PuzzleContainer,
  PuzzleContent,
  PuzzleItem,
  PuzzlesLayout,
  PuzzlesNewsletter,
  PuzzlesSupportingContent,
}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{verifyNoInteractions, when}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.Json
import play.api.{Environment, Mode}
import services.newsletters.model.NewsletterResponseV2
import services.newsletters.{NewsletterApi, NewsletterSignupAgent}

import java.io.{ByteArrayInputStream, File, InputStream}
import java.nio.charset.StandardCharsets
import java.time.{Clock, Instant, LocalDate, ZoneOffset}
import scala.collection.mutable.ListBuffer
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Future}

class PuzzlesLayoutProviderTest extends AnyFlatSpec with Matchers with MockitoSugar {
  private implicit val executionContext: ExecutionContext = ExecutionContext.global
  private val mondayClock = Clock.fixed(Instant.parse("2026-09-07T12:00:00Z"), ZoneOffset.UTC)

  "LocalJsonPuzzlesLayoutProvider" should "load the production layout from the classpath" in {
    val provider = productionProvider()

    val layout = Await.result(provider.getLayout(), 5.seconds)

    layout.containers should not be empty
    layout.containers.flatMap(_.content.nestedContainers) should not be empty
    archives(layout) should not be empty
  }

  it should "load the target hierarchy and its explicit presentation metadata" in {
    val provider = productionProvider()

    val layout = Await.result(provider.getLayout(), 5.seconds)
    val featured = layout.containers.head
    val crosswords = layout.containers.find(_.id == "crosswords").get

    val firstAdIndex = layout.containers.indexWhere(_.variant.contains("ad"))
    firstAdIndex shouldBe (layout.containers.indexWhere(_.id == "crosswords") + 1)
    layout.containers(firstAdIndex).id shouldBe "crosswords-ad"
    layout.containers(firstAdIndex).adSlot shouldBe Some("inline1")

    layout.containers
      .filter(container => container.variant.exists(Set("featured", "standard")))
      .map(_.title) shouldBe Seq(
      "Featured today",
      "Crosswords",
      "Word games",
      "Logic puzzles",
      "Trivia & quizzes",
    )
    layout.containers.filter(_.variant.contains("ad")).map(_.adSlot) shouldBe Seq(
      Some("inline1"),
      Some("inline2"),
    )
    featured.content.items.flatten.map(item => (item.title, item.cardVariant, item.cadence)) shouldBe Seq(
      ("Quick crossword", "large", None),
      ("Easy sudoku", "large", None),
    )
    crosswords.content.items.map(_.map(item => item.title -> item.cardVariant)) shouldBe Seq(
      Seq("Quick", "Mini", "Cryptic", "Weekend").map(_ -> "primary"),
      Seq("Quick cryptic", "Quiptic", "Prize", "Sunday quick", "Genius").map(_ -> "compact"),
    )
    crosswords.content.items.flatten.filterNot(_.title == "Genius").flatMap(_.cadence) shouldBe empty
    crosswords.content.items.flatten.find(_.title == "Genius").flatMap(_.cadence) shouldBe Some("Monthly")
    crosswords.content.archiveChoices.map(_.map(_.title)) shouldBe Some(
      Seq(
        "Quick",
        "Mini",
        "Cryptic",
        "Weekend",
        "Quick cryptic",
        "Quiptic",
        "Prize",
        "Sunday quick",
      ),
    )
    // The archive dropdown follows the order of the cards on the hub (Genius has no archive).
    crosswords.content.archiveChoices.toSeq.flatten.map(_.title) shouldBe
      crosswords.content.items.flatten.map(_.title).filterNot(_ == "Genius")
    crosswords.content.archiveChoices.toSeq.flatten.map(_.url) shouldBe Seq(
      Some("/puzzles-and-games/crosswords/archive?puzzle=archive-quick"),
      Some("/puzzles-and-games/crosswords/archive?puzzle=archive-mini"),
      Some("/puzzles-and-games/crosswords/archive?puzzle=archive-cryptic"),
      Some("/puzzles-and-games/crosswords/archive?puzzle=archive-weekend"),
      Some("/puzzles-and-games/crosswords/archive?puzzle=archive-quick-cryptic"),
      Some("/puzzles-and-games/crosswords/archive?puzzle=archive-quiptic"),
      Some("/puzzles-and-games/crosswords/archive?puzzle=archive-prize"),
      Some("/puzzles-and-games/crosswords/archive?puzzle=archive-sunday-quick"),
    )
    layout.containers.find(_.id == "word-games").flatMap(_.content.archiveChoices).map(_.flatMap(_.url)) shouldBe
      Some(Seq("/puzzles-and-games/word-games/archive?puzzle=word-wheel-daily"))
    layout.containers.find(_.id == "logic-puzzles").flatMap(_.content.archiveChoices).map(_.flatMap(_.url)) shouldBe
      Some(
        Seq(
          "/puzzles-and-games/logic-puzzles/archive?puzzle=sudoku-easy",
          "/puzzles-and-games/logic-puzzles/archive?puzzle=sudoku-medium",
          "/puzzles-and-games/logic-puzzles/archive?puzzle=sudoku-hard",
          "/puzzles-and-games/logic-puzzles/archive?puzzle=sudoku-killer",
        ),
      )
    layout.containers
      .find(_.variant.contains("supporting"))
      .flatMap(_.supporting)
      .map(_.popularGroups.map(_.title)) shouldBe
      Some(Seq("Most played", "Most comments"))
    allItems(layout).find(_.id == "wordiply-daily").flatMap(_.image) shouldBe Some(artwork("word-games-WORDIPLY"))
    allItems(layout).map(_.id).distinct should have size allItems(layout).size
  }

  it should "provide the trivia hub cards with uploaded artwork and no archive links" in {
    val layout = Await.result(productionProvider().getLayout(), 5.seconds)
    val trivia = layout.containers.find(_.id == "trivia-and-quizzes").get
    val cards = trivia.content.items.flatten

    trivia.title shouldBe "Trivia & quizzes"
    cards.map(_.title) shouldBe Seq("Film reveal", "On the ball")
    cards.map(_.`type`) shouldBe Seq("film-reveal", "on-the-ball")
    all(cards.map(_.cadence)) shouldBe Some("Daily")
    all(cards.map(_.set)) shouldBe "all"
    all(cards.map(_.cardVariant)) shouldBe "primary"
    all(cards.map(_.variant)) shouldBe Some("iframe-page")
    all(cards.map(_.date)) shouldBe Some("2026-09-07")
    cards.map(_.slug) shouldBe Seq(Some("trivia-and-quizzes/film-reveal"), Some("trivia-and-quizzes/on-the-ball"))
    cards.flatMap(_.url) shouldBe empty
    cards.flatMap(_.image) shouldBe Seq(
      "https://i.guim.co.uk/img/uploads/2026/10/28/film-reveal-standard.png?width=440&dpr=2&s=none",
      "https://i.guim.co.uk/img/uploads/2026/10/28/on-the-ball-standard.png?width=440&dpr=2&s=none",
    )
    cards.flatMap(_.imageAlt) shouldBe Seq("Film reveal illustration", "On the ball illustration")
    all(cards.map(_.backgroundColour)) shouldBe Some("#F3FBFB")
    trivia.content.archiveChoices shouldBe None
  }

  it should "select the configured featured puzzles for each London weekday" in {
    val expectedByDate = Seq(
      "2026-09-07T12:00:00Z" -> Seq("Quick crossword", "Easy sudoku"),
      "2026-09-08T12:00:00Z" -> Seq("Mini crossword", "Word wheel"),
      "2026-09-09T12:00:00Z" -> Seq("Cryptic crossword", "Medium sudoku"),
      "2026-09-10T12:00:00Z" -> Seq("Quick crossword", "Wordiply"),
      "2026-09-11T12:00:00Z" -> Seq("Mini crossword", "Hard sudoku"),
      "2026-09-12T12:00:00Z" -> Seq("General knowledge crossword", "Killer sudoku"),
      "2026-09-13T12:00:00Z" -> Seq("Quiptic crossword", "Word wheel"),
    )

    expectedByDate.foreach { case (instant, expectedTitles) =>
      val provider = providerFor(
        featuredLayout(enabled = true),
        archiveApi(Nil),
        Clock.fixed(Instant.parse(instant), ZoneOffset.UTC),
      )

      firstItemRow(Await.result(provider.getLayout(), 5.seconds)).map(_.title) shouldBe expectedTitles
    }
  }

  it should "omit the featured section when it is disabled" in {
    val provider = providerFor(featuredLayout(enabled = false), archiveApi(Nil), mondayClock)

    Await.result(provider.getLayout(), 5.seconds).containers shouldBe empty
  }

  it should "give every iframe play card a London date before client-side API enrichment" in {
    val items = allItems(Await.result(productionProvider().getLayout(), 5.seconds))
    val iframeItems = items.filter(_.variant.contains("iframe-page"))

    iframeItems.map(_.`type`).toSet shouldBe Set("sudoku", "word-wheel", "wordiply", "film-reveal", "on-the-ball")
    all(iframeItems.map(_.date)) shouldBe Some("2026-09-07")
  }

  it should "use the London day at midnight and preserve explicitly selected puzzle dates" in {
    val clock = Clock.fixed(Instant.parse("2026-09-06T23:30:00Z"), ZoneOffset.UTC)
    val daily = PuzzleItem("wheel", "Word wheel", "word-wheel", "all", "primary", variant = Some("iframe-page"))
    val dated = daily.copy(id = "dated-wheel", date = Some("2026-09-01"))
    val archive = daily.copy(id = "wheel-archive", variant = Some("archive-page"))
    val result =
      Await.result(providerFor(layoutWith(Seq(daily, dated, archive)), archiveApi(Nil), clock).getLayout(), 5.seconds)

    allItems(result).map(_.date) shouldBe Seq(Some("2026-09-07"), Some("2026-09-01"), None)
  }

  it should "use section-prefixed slugs and daily iframe destinations for word games and sudokus" in {
    val provider = productionProvider()
    val items = allItems(Await.result(provider.getLayout(), 5.seconds)).map(item => item.id -> item).toMap

    items("word-wheel-daily").slug shouldBe Some("word-games/word-wheel")
    items("wordiply-daily").slug shouldBe Some("word-games/wordiply")
    Seq("sudoku-easy", "sudoku-medium", "sudoku-hard", "sudoku-killer").foreach { id =>
      items(id).slug shouldBe Some(s"logic-puzzles/$id")
      items(id).url.exists(_.contains("idx=1")) shouldBe true
    }
    items("word-wheel-daily").url.exists(_.contains("idx=1")) shouldBe true
  }

  it should "use the supplied artwork for every configured puzzle card" in {
    val provider = productionProvider()
    val items = allItems(Await.result(provider.getLayout(), 5.seconds)).map(item => item.id -> item).toMap
    val expectedArtwork = Map(
      "crossword-quick" -> "crossword-QUICK",
      "crossword-mini" -> "crossword-MINI",
      "crossword-cryptic" -> "crossword-CRYPTIC",
      "crossword-quick-cryptic" -> "crossword-QUICK-CRYPTIC",
      "crossword-quiptic" -> "crossword-QUIPTIC",
      "crossword-prize" -> "crossword-PRIZE",
      "crossword-weekend" -> "crossword-GENERAL-KNOWLEDGE",
      "crossword-genius" -> "crossword-GENIUS",
      "word-wheel-daily" -> "word-games-WORD-WHEEL",
      "wordiply-daily" -> "word-games-WORDIPLY",
      "sudoku-easy" -> "logic-puzzles-SUDOKU-EASY",
      "sudoku-medium" -> "logic-puzzles-SUDOKU-MEDIUM",
      "sudoku-hard" -> "logic-puzzles-SUDOKU-HARD",
      "sudoku-killer" -> "logic-puzzles-SUDOKU-KILLER",
    )
    expectedArtwork.foreach { case (id, filename) =>
      items(id).image shouldBe Some(artwork(filename))
      items(id).imageAlt.exists(_.trim.nonEmpty) shouldBe true
    }
  }

  it should "use the matching artwork throughout the weekly featured schedule" in {
    val expectedArtwork = Map(
      "Quick crossword" -> "crossword-QUICK",
      "Mini crossword" -> "crossword-MINI",
      "Cryptic crossword" -> "crossword-CRYPTIC",
      "General knowledge crossword" -> "crossword-GENERAL-KNOWLEDGE",
      "Quiptic crossword" -> "crossword-QUIPTIC",
      "Easy sudoku" -> "logic-puzzles-SUDOKU-EASY",
      "Medium sudoku" -> "logic-puzzles-SUDOKU-MEDIUM",
      "Hard sudoku" -> "logic-puzzles-SUDOKU-HARD",
      "Killer sudoku" -> "logic-puzzles-SUDOKU-KILLER",
      "Word wheel" -> "word-games-WORD-WHEEL",
      "Wordiply" -> "word-games-WORDIPLY",
    )
    val featured = (0 until 7).flatMap { offset =>
      val clock = Clock.fixed(mondayClock.instant().plusSeconds(offset * 86400L), ZoneOffset.UTC)
      val provider = providerFor(featuredLayout(enabled = true), archiveApi(Nil), clock)
      allItems(Await.result(provider.getLayout(), 5.seconds))
    }
    featured.filter(item => expectedArtwork.contains(item.title)).foreach { item =>
      item.image shouldBe Some(artwork(expectedArtwork(item.title)))
      item.imageAlt shouldBe Some(s"${item.title} illustration")
    }
    featured.filter(_.`type` == "sudoku").foreach { item =>
      item.slug shouldBe Some(s"logic-puzzles/${item.id.stripPrefix("featured-")}")
      item.url.exists(_.contains("idx=1")) shouldBe true
    }
    featured.filter(item => Set("word-wheel", "wordiply").contains(item.`type`)).foreach { item =>
      item.slug shouldBe Some(s"word-games/${item.`type`}")
    }
    featured.filter(_.`type` == "word-wheel").foreach(_.url.exists(_.contains("idx=1")) shouldBe true)
    expectedArtwork.keySet shouldBe featured.map(_.title).toSet
  }

  it should "configure the hub newsletter by identity name only" in {
    val stream = Environment.simple().resourceAsStream(LocalJsonPuzzlesLayoutProvider.DefaultResourceName).get
    val configured =
      try Json.parse(stream).as[PuzzlesLayout]
      finally stream.close()
    configured.containers.flatMap(_.supporting).map(_.newsletterIdentityName) shouldBe Seq(Some("cluesletter"))
    configured.containers.flatMap(_.supporting).flatMap(_.newsletter) shouldBe empty
  }

  it should "resolve the configured newsletter from the newsletters API" in {
    val provider = providerFor(
      supportingLayout(Some("cluesletter")),
      archiveApi(Nil),
      newsletterAgent = newsletterAgentReturning(Right(Some(newsletterResponse()))),
    )
    val supporting = supportingContent(Await.result(provider.getLayout(), 5.seconds))

    supporting.newsletter shouldBe Some(
      PuzzlesNewsletter(
        identityName = "cluesletter",
        name = "Cluesletter",
        frequency = "Weekly",
        description = "Get our news, clues and competitions",
        illustrationSquare = Some("https://example.com/square.png"),
      ),
    )
    supporting.newsletterIdentityName shouldBe None
  }

  it should "fall back to the card illustration when the newsletter has no square one" in {
    val provider = providerFor(
      supportingLayout(Some("cluesletter")),
      archiveApi(Nil),
      newsletterAgent = newsletterAgentReturning(Right(Some(newsletterResponse().copy(illustrationSquare = None)))),
    )
    supportingContent(Await.result(provider.getLayout(), 5.seconds)).newsletter
      .flatMap(_.illustrationSquare) shouldBe Some("https://example.com/card.png")
  }

  it should "pass the example URL through as a site path or absolute URL" in {
    Seq(
      Some("lifeandstyle/series/cluesletter/latest") -> Some("/lifeandstyle/series/cluesletter/latest"),
      Some("/email/cluesletter") -> Some("/email/cluesletter"),
      Some("https://example.com/latest") -> Some("https://example.com/latest"),
      Some("  ") -> None,
      None -> None,
    ).foreach { case (configured, expected) =>
      val provider = providerFor(
        supportingLayout(Some("cluesletter")),
        archiveApi(Nil),
        newsletterAgent = newsletterAgentReturning(Right(Some(newsletterResponse().copy(exampleUrl = configured)))),
      )
      supportingContent(Await.result(provider.getLayout(), 5.seconds)).newsletter
        .flatMap(_.exampleUrl) shouldBe expected
    }
  }

  it should "omit the newsletter when it is not live, restricted, unknown or the lookup fails" in {
    Seq(
      Right(Some(newsletterResponse(status = "paused"))),
      Right(Some(newsletterResponse(restricted = true))),
      Right(None),
      Left("Newsletters API unavailable"),
    ).foreach { result =>
      val provider = providerFor(
        supportingLayout(Some("cluesletter")),
        archiveApi(Nil),
        newsletterAgent = newsletterAgentReturning(result),
      )
      val supporting = supportingContent(Await.result(provider.getLayout(), 5.seconds))
      supporting.newsletter shouldBe None
      supporting.newsletterIdentityName shouldBe None
    }
  }

  it should "close the resource stream after successful loading" in {
    val json = """{"containers":[]}"""
    val stream = new CloseTrackingInputStream(json)
    val provider =
      new LocalJsonPuzzlesLayoutProvider(
        environmentReturning(Some(stream)),
        archiveApi(Nil),
        emptyNewsletterAgent(),
      )

    Await.result(provider.getLayout(), 5.seconds) shouldBe PuzzlesLayout(Seq.empty)
    stream.wasClosed shouldBe true
  }

  it should "resolve game sponsorship from configuration without fetching hub content" in {
    val sponsor = Json.obj(
      "name" -> "Game sponsor",
      "label" -> "Supported by",
      "sponsorUri" -> "https://example.com",
      "logo" -> Json.obj("src" -> "https://example.com/logo.png", "aspectRatio" -> 2.0),
    )
    val json = Json.obj(
      "containers" -> Json.arr(),
      "sponsorship" -> Json.obj("AU" -> (sponsor + ("name" -> Json.toJson("Hub sponsor")))),
      "gameSponsorship" -> Json.obj("word-games" -> Json.obj("AU" -> sponsor)),
    )
    val stream = new CloseTrackingInputStream(Json.stringify(json))
    val api = mock[PuzzlesArchiveApi]
    val newsletters = mock[NewsletterSignupAgent]
    val provider = new LocalJsonPuzzlesLayoutProvider(environmentReturning(Some(stream)), api, newsletters)

    val commercialProperties = Await.result(provider.getGameCommercialProperties("word-games"), 5.seconds)

    commercialProperties.keySet shouldBe Set("AU")
    commercialProperties("AU").branding.map(_.sponsorName) shouldBe Some("Hub sponsor")
    stream.wasClosed shouldBe true
    verifyNoInteractions(api, newsletters)
  }

  it should "fail clearly and close the stream when the blueprint is invalid" in {
    val stream = new CloseTrackingInputStream("""{"containers":[{"title":"incomplete"}]}""")
    val provider =
      new LocalJsonPuzzlesLayoutProvider(
        environmentReturning(Some(stream)),
        archiveApi(Nil),
        emptyNewsletterAgent(),
      )

    val error = the[IllegalArgumentException] thrownBy Await.result(provider.getLayout(), 5.seconds)

    error.getMessage should include("puzzles-layout.json")
    error.getMessage should include("is invalid")
    stream.wasClosed shouldBe true
  }

  it should "fail clearly and close the stream when the resource contains malformed JSON" in {
    val stream = new CloseTrackingInputStream("""{"containers": [""")
    val provider =
      new LocalJsonPuzzlesLayoutProvider(
        environmentReturning(Some(stream)),
        archiveApi(Nil),
        emptyNewsletterAgent(),
      )

    val error = the[IllegalArgumentException] thrownBy Await.result(provider.getLayout(), 5.seconds)

    error.getMessage should include("puzzles-layout.json")
    error.getMessage should include("could not be parsed as JSON")
    stream.wasClosed shouldBe true
  }

  it should "fail clearly when the classpath resource is missing" in {
    val provider =
      new LocalJsonPuzzlesLayoutProvider(environmentReturning(None), archiveApi(Nil), emptyNewsletterAgent())

    val error = the[IllegalStateException] thrownBy Await.result(provider.getLayout(), 5.seconds)

    error.getMessage should include("puzzles-layout.json")
    error.getMessage should include("was not found on the classpath")
  }

  it should "use the latest API destination verbatim and preserve configured artwork" in {
    val old = apiItem.copy(publishDate = "2026-09-01T00:00:00Z", gameUrl = Some("/old"))
    val base = crossword("quick").copy(setter = Some("Previous setter"))
    val result = Await.result(providerFor(layoutWith(Seq(base)), archiveApi(Seq(apiItem, old))).getLayout(), 5.seconds)
    firstItem(result) shouldBe base.copy(
      url = apiItem.gameUrl,
      setter = Some("New setter"),
      imageAlt = Some("quick illustration"),
    )
  }

  it should "preserve configured setters when the API has no usable credit" in {
    Seq(None, Some("   ")).foreach { setter =>
      val base = crossword("quick").copy(setter = Some("Configured setter"))
      val result = Await.result(
        providerFor(layoutWith(Seq(base)), archiveApi(Seq(apiItem.copy(setterName = setter)))).getLayout(),
        5.seconds,
      )
      firstItem(result).setter shouldBe base.setter
    }
  }

  it should "supply a grid image for numbered crosswords without overriding editorial artwork" in {
    val base = crossword("quick").copy(image = None)
    val result = Await.result(
      providerFor(layoutWith(Seq(base)), archiveApi(Seq(apiItem.copy(puzzleId = "123")))).getLayout(),
      5.seconds,
    )
    firstItem(result).image shouldBe Some("https://api.nextgen.guardianapps.co.uk/crosswords/quick/123.svg")
  }

  it should "preserve article-style Genius destinations from the API" in {
    val genius =
      apiItem.copy(puzzleType = "CROSSWORD_GENIUS", gameUrl = Some("/crosswords/2026/sep/07/genius-crossword-no-280"))
    val result =
      Await.result(providerFor(layoutWith(Seq(crossword("genius"))), archiveApi(Seq(genius))).getLayout(), 5.seconds)
    firstItem(result).url shouldBe genius.gameUrl
  }

  it should "enrich featured cards and deduplicate nested lookups by puzzle type" in {
    val calls = ListBuffer.empty[String]
    val nested = PuzzleContainer(
      "nested",
      "Nested",
      content = PuzzleContent(Seq(Seq(crossword("quick").copy(id = "nested-quick"))), Nil),
    )
    val result = Await.result(
      providerFor(layoutWith(Seq(crossword("quick")), Seq(nested)), archiveApi(Seq(apiItem), calls)).getLayout(),
      5.seconds,
    )
    calls.toSeq shouldBe Seq("CROSSWORD_QUICK")
    allItems(result).flatMap(_.url).distinct shouldBe Seq(apiItem.gameUrl.get)
    val featured =
      Await.result(providerFor(featuredLayout(true), archiveApi(Seq(apiItem)), mondayClock).getLayout(), 5.seconds)
    firstItem(featured).url shouldBe apiItem.gameUrl
    firstItem(featured).image shouldBe Some(artwork("crossword-QUICK"))
  }

  it should "leave archive cards, non-crosswords and unsupported sets unchanged" in {
    val calls = ListBuffer.empty[String]
    val base = layoutWith(
      Seq(crossword("unknown"), crossword("quick").copy(`type` = "sudoku")),
      archive = Some(crossword("quick").copy(id = "archive-quick", cardVariant = "archive")),
    )
    Await.result(providerFor(base, archiveApi(Seq(apiItem), calls)).getLayout(), 5.seconds) shouldBe base
    calls shouldBe empty
  }

  it should "preserve base values when the API fails or has no usable destination" in {
    val base = layoutWith(Seq(crossword("quick")))
    val failing = new PuzzlesArchiveApi {
      override def get(start: LocalDate, end: LocalDate, puzzleType: String, authorization: Option[String])(implicit
          ec: ExecutionContext,
      ): Future[Seq[PuzzlesApiItem]] = Future.failed(new RuntimeException("unavailable"))
    }
    Seq(failing, archiveApi(Nil), archiveApi(Seq(apiItem.copy(gameUrl = None)))).foreach { api =>
      Await.result(providerFor(base, api).getLayout(), 5.seconds) shouldBe base
    }
  }

  private val apiItem = PuzzlesApiItem(
    "opaque-id",
    "CROSSWORD_QUICK",
    "2026-09-07T00:00:00Z",
    0,
    Some(" New setter "),
    Some("/crosswords/quick/123?source=api"),
  )

  private def archiveApi(items: Seq[PuzzlesApiItem], calls: ListBuffer[String] = ListBuffer.empty): PuzzlesArchiveApi =
    new PuzzlesArchiveApi {
      override def get(start: LocalDate, end: LocalDate, puzzleType: String, authorization: Option[String])(implicit
          ec: ExecutionContext,
      ): Future[Seq[PuzzlesApiItem]] = {
        calls += puzzleType
        Future.successful(items.filter(_.puzzleType == puzzleType))
      }
    }

  private def crossword(set: String, url: String = "/base"): PuzzleItem =
    PuzzleItem(
      id = s"crossword-$set",
      title = set,
      `type` = "crossword",
      set = set,
      cardVariant = "primary",
      cadence = Some("Daily"),
      url = Some(url),
      image = Some(s"$url.svg"),
      backgroundColour = Some("#f0f0f0"),
    )

  private def artwork(filename: String): String =
    s"https://i.guim.co.uk/img/uploads/2026/09/15/$filename.png?width=440&dpr=2&s=none"

  private def layoutWith(
      items: Seq[PuzzleItem],
      nestedContainers: Seq[PuzzleContainer] = Seq.empty,
      archive: Option[PuzzleItem] = None,
  ): PuzzlesLayout =
    PuzzlesLayout(
      containers = Seq(
        PuzzleContainer(
          id = "test-container",
          title = "Test container",
          variant = Some("featured"),
          content = PuzzleContent(Seq(items), nestedContainers, archive),
          desktopSpan = Some(12),
        ),
      ),
    )

  private def featuredLayout(enabled: Boolean): PuzzlesLayout =
    PuzzlesLayout(
      Seq(
        PuzzleContainer(
          id = "featured-puzzles",
          title = "Featured today",
          variant = Some("featured"),
          content = PuzzleContent(Seq.empty, Seq.empty),
          enabled = Some(enabled),
        ),
      ),
    )

  private def providerFor(
      layout: PuzzlesLayout,
      client: PuzzlesArchiveApi,
      clock: Clock = Clock.systemUTC(),
      newsletterAgent: NewsletterSignupAgent = emptyNewsletterAgent(),
  ): LocalJsonPuzzlesLayoutProvider = {
    val stream = new CloseTrackingInputStream(Json.stringify(Json.toJson(layout)))
    new LocalJsonPuzzlesLayoutProvider(environmentReturning(Some(stream)), client, newsletterAgent, clock = clock)
  }

  private def productionProvider(): LocalJsonPuzzlesLayoutProvider =
    new LocalJsonPuzzlesLayoutProvider(
      Environment.simple(),
      archiveApi(Nil),
      emptyNewsletterAgent(),
      clock = mondayClock,
    )

  private def emptyNewsletterAgent(): NewsletterSignupAgent = new NewsletterSignupAgent(mock[NewsletterApi])

  private def newsletterAgentReturning(
      result: Either[String, Option[NewsletterResponseV2]],
  ): NewsletterSignupAgent = {
    val agent = mock[NewsletterSignupAgent]
    when(agent.getV2NewsletterByName(any[String])).thenReturn(result)
    agent
  }

  private def newsletterResponse(status: String = "live", restricted: Boolean = false): NewsletterResponseV2 =
    NewsletterResponseV2(
      identityName = "cluesletter",
      listId = 6075,
      name = "Cluesletter",
      theme = "lifestyle",
      group = "Culture",
      status = status,
      restricted = restricted,
      signUpEmbedDescription = "Get our news, clues and competitions",
      signUpDescription = "Long description",
      frequency = "Weekly",
      mailSuccessDescription = None,
      regionFocus = None,
      illustrationCard = Some("https://example.com/card.png"),
      illustrationCircle = None,
      illustrationSquare = Some("https://example.com/square.png"),
      seriesTag = None,
      signupPage = None,
      exampleUrl = None,
      category = "article-based",
      emailConfirmation = false,
    )

  private def supportingLayout(newsletterIdentityName: Option[String]): PuzzlesLayout =
    PuzzlesLayout(
      Seq(
        PuzzleContainer(
          id = "puzzles-supporting",
          title = "",
          variant = Some("supporting"),
          content = PuzzleContent(Seq.empty, Seq.empty),
          supporting = Some(
            PuzzlesSupportingContent(
              usefulLinksTitle = "Useful links",
              usefulLinks = Seq.empty,
              newsletter = None,
              popularTitle = "Most popular puzzles",
              popularGroups = Seq.empty,
              newsletterIdentityName = newsletterIdentityName,
            ),
          ),
        ),
      ),
    )

  private def supportingContent(layout: PuzzlesLayout): PuzzlesSupportingContent =
    layout.containers.flatMap(_.supporting).head

  private def firstItem(layout: PuzzlesLayout): PuzzleItem = allItems(layout).head

  private def firstItemRow(layout: PuzzlesLayout): Seq[PuzzleItem] = layout.containers.head.content.items.head

  private def allItems(layout: PuzzlesLayout): Seq[PuzzleItem] =
    layout.containers.flatMap(allItems)

  private def allItems(container: PuzzleContainer): Seq[PuzzleItem] =
    container.content.items.flatten ++ container.content.nestedContainers.flatMap(allItems)

  private def archives(layout: PuzzlesLayout): Seq[PuzzleItem] =
    layout.containers.flatMap(archives)

  private def archives(container: PuzzleContainer): Seq[PuzzleItem] =
    container.content.archive.toSeq ++
      container.content.archiveChoices.toSeq.flatten ++
      container.content.nestedContainers.flatMap(archives)

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
