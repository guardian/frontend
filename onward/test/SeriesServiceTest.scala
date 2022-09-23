import common.Edition
import org.scalatest.BeforeAndAfterAll
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test.FakeRequest
import services.SeriesService

import scala.concurrent.duration._
import test.{
  SingleServerSuite,
  WithMaterializer,
  WithTestApplicationContext,
  WithTestContentApiClient,
  WithTestFrontJsonFapi,
  WithTestWsClient,
}

import scala.concurrent.Await

class SeriesServiceTest
    extends AnyFlatSpec
    with Matchers
    with SingleServerSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient
    with WithTestFrontJsonFapi {

  implicit val request = FakeRequest("GET", "/")
  lazy val seriesService = new SeriesService(testContentApiClient)

  it should "return book of the day" in {
    val result = Await.result(seriesService.fetch(Edition.defaultEdition, "books/series/book-of-the-day"), 5.second)
    result.get.heading shouldBe "books/series/book-of-the-day"
    result.get.trails.length shouldBe 10
  }

  it should "return None if tag is not valid" in {
    val result = Await.result(seriesService.fetch(Edition.defaultEdition, "invalid-tag"), 5.second)
    result shouldBe None
  }
}
