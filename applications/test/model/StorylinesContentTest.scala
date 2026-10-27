package model

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.Instant
import scala.io.Source

class StorylinesContentTest extends AnyFlatSpec with Matchers {

  private val fixture: String = {

    /** The fixture is derived from the Storylines API:
      * https://storylines.gutools.co.uk/api/generation-runs/<GENERATION_RUN_ID>/rendered Generation runs are listed at:
      * https://storylines.gutools.co.uk/home
      */
    val stream = getClass.getResourceAsStream("/StorylinesContent.fixture.json")
    val source = Source.fromInputStream(stream)
    try source.mkString
    finally source.close()
  }

  "StorylinesContent.decode" should "decode the fixture successfully" in {
    StorylinesContent.decode(fixture) should be(Symbol("right"))
  }

  it should "decode the top-level metadata, ignoring fields absent from the model" in {
    val content = StorylinesContent.decode(fixture).toOption.get

    content.tag shouldBe "music/country"
    content.created shouldBe Instant.parse("2026-10-15T15:36:20.730Z")
    content.earliestArticleTime shouldBe Some(Instant.parse("2024-01-20T15:00:01Z"))
    content.latestArticleTime shouldBe Some(Instant.parse("2026-10-13T19:05:18Z"))
  }

  it should "decode all storylines and their nested categories" in {
    val content = StorylinesContent.decode(fixture).toOption.get

    content.storylines.map(_.title) shouldBe List(
      "Dolly Parton's death and legacy",
      "Country music's crossover boom and UK fanbase",
      "Beyoncé, Cowboy Carter and country music's colour line",
    )

    content.storylines.head.content.map(_.category) shouldBe List(
      "Key Stories",
      "Opinions",
      "Deep Reads",
      "Find multimedia",
      "Profiles and Interviews",
    )
  }

  it should "decode an article and its image" in {
    val content = StorylinesContent.decode(fixture).toOption.get

    val article = content.storylines.head.content.head.articles.head

    article.url shouldBe "https://www.theguardian.com/music/2026/sep/25/dolly-parton-day-declared"
    article.headline shouldBe "Dolly Parton Day declared in various cities and states across the US on 9/25"
    article.byline shouldBe Some("Marina Dunbar")
    article.publicationTime shouldBe Instant.parse("2026-09-25T17:54:01Z")

    val image = article.image.get
    image.src shouldBe Some(
      "https://media.guim.co.uk/f68a1d1f29eec7b2628518e2587a59294b5d262d/0_0_7861_5241/master/7861.jpg",
    )
    image.isAvatar shouldBe false
    image.mediaData shouldBe None
  }

  it should "decode the polymorphic media data variants" in {
    val content = StorylinesContent.decode(fixture).toOption.get

    val mediaData = for {
      storyline <- content.storylines
      category <- storyline.content
      article <- category.articles
      image <- article.image.toList
      media <- image.mediaData.toList
    } yield media

    mediaData should contain(StorylinesAudio(duration = "14:33"))
    mediaData should contain(StorylinesGallery(count = "50"))
  }

  it should "report a decoding failure for invalid JSON" in {
    StorylinesContent.decode("{ not valid json }") should be(Symbol("left"))
  }
}
