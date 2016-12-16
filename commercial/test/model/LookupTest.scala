package commercial.model.capi

import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import test.{ConfiguredTestSuite, WithMaterializer, WithTestContentApiClient, WithTestWsClient}

import scala.concurrent.Await
import scala.concurrent.duration._

@DoNotDiscover class LookupTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestContentApiClient {

  lazy val lookup = new Lookup(testContentApiClient)

  private val timeout = 10.seconds

  private def contentsOf(shortUrls: String*) = {
    val futureContents = lookup.contentByShortUrls(shortUrls)
    Await.result(futureContents, timeout)
  }

  private def contentsForKeyword(keywordId: String) = {
    val futureContents = lookup.latestContentByKeyword(keywordId, 4)
    Await.result(futureContents, timeout)
  }

  "contentByShortUrls" should "find content for genuine URLs" in {
    val contents = contentsOf("http://gu.com/p/3qeqm", "http://gu.com/p/4v86p", "https://gu.com/p/4vf6t")
    contents.map(_.metadata.webTitle) should be(Seq(
      "Wikipedia: meet the man who has edited 3m articles",
      "A book for the beach: In the Woods by Tana French",
      "Norway minister threatens to deport Eritrean migrants"
    ))
  }

  it should "find content for short URL ids with campaign suffixes" in {
    contentsOf("p/4z2fv/stw", "p/4nx5n/stw").map(_.metadata.webTitle) should be(
      Seq(
        "Papua New Guinea unveiled: exclusive photos of the nation’s tribal culture", "Defining Moment: a photographer's snap decision in the face of danger (part 1)"
      )
    )
  }

  it should "not find content for fake URLs" in {
    contentsOf("http://gu.com/p/3qeqmjlkk", "https://gu.com/p/4gfshstv86p") should be(Nil)
  }

  it should "not find content for badly-formed URLs" in {
    contentsOf("abc", "def") should be(Nil)
  }

  it should "not find content for empty seq of URLs" in {
    contentsOf() should be(Nil)
  }

  "latestContentByKeyword" should "find content ordered reverse chronologically for an existing keyword" in {
    val contents = contentsForKeyword("technology/apple")
    contents should have size 4
    contents.sortBy(_.trail.webPublicationDate.getMillis).reverse should be(contents)
  }

  "latestContentByKeyword" should "not find content for a non-existent keyword" in {
    contentsForKeyword("jklkl") should be(Nil)
  }
}
