package commercial.model.capi

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import test.{ConfiguredTestSuite, WithMaterializer, WithTestContentApiClient, WithTestWsClient}

import scala.concurrent.Await
import scala.concurrent.duration._

@DoNotDiscover class LookupTest
    extends AnyFlatSpec
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

  /** Get the 4 latest pieces of content for a specific keyword */
  private def contentsForKeyword(keywordId: String) = {
    val futureContents = lookup.latestContentByKeyword(keywordId, 4)
    Await.result(futureContents, timeout)
  }

  /*
    Date: 02nd Dec 2020
    Some tests (those with hardcoded short urls), come in two versions "gu.com" and "www.theguardian.com", this is due to a CAPI migration.
    See (id: 288767d7-ba82-4d67-8fb3-9139e67b0f2e) , for details.
   */

  "contentByShortUrls (gu.com)" should "find content for genuine URLs" in {
    val contents = contentsOf("http://gu.com/p/3qeqm", "http://gu.com/p/4v86p", "https://gu.com/p/4vf6t")
    contents.map(_.metadata.webTitle) should be(
      Seq(
        "Wikipedia: meet the man who has edited 3m articles",
        "A book for the beach: In the Woods by Tana French",
        "Norway minister threatens to deport Eritrean migrants",
      ),
    )
  }

  "contentByShortUrls (www.theguardian.com)" should "find content for genuine URLs" in {
    val contents = contentsOf(
      "http://www.theguardian.com/p/3qeqm",
      "http://www.theguardian.com/p/4v86p",
      "https://www.theguardian.com/p/4vf6t",
    )
    contents.map(_.metadata.webTitle) should be(
      Seq(
        "Wikipedia: meet the man who has edited 3m articles",
        "A book for the beach: In the Woods by Tana French",
        "Norway minister threatens to deport Eritrean migrants",
      ),
    )
  }

  it should "find content for short URL ids with campaign suffixes" in {
    contentsOf("p/4z2fv/stw", "p/4nx5n/stw").map(_.metadata.webTitle) should be(
      Seq(
        "Papua New Guinea unveiled: exclusive photos of the nation’s tribal culture",
        "Defining Moment: a photographer's snap decision in the face of danger (part 1)",
      ),
    )
  }

  it should "not find content for fake URLs (gu.com)" in {
    contentsOf("http://gu.com/p/3qeqmjlkk", "https://gu.com/p/4gfshstv86p") should be(Nil)
  }

  it should "not find content for fake URLs (www.theguardian.com)" in {
    contentsOf("http://www.theguardian.com/p/3qeqmjlkk", "https://wwww.theguardian.com/p/4gfshstv86p") should be(Nil)
  }

  it should "not find content for badly-formed URLs" in {
    contentsOf("abc", "def") should be(Nil)
  }

  it should "not find content for empty seq of URLs" in {
    contentsOf() should be(Nil)
  }

  "latestContentByKeyword" should "find 4 pieces of content by default for an existing keyword" in {
    val contents = contentsForKeyword("technology/apple")
    contents should have size 4
  }

  "latestContentByKeyword" should "not find content for a non-existent keyword" in {
    contentsForKeyword("jklkl") should be(Nil)
  }
}
