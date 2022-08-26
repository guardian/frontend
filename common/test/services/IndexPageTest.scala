package services

import common.Edition
import common.editions.Uk
import model.{Section, Tags}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.matchers.should.Matchers
import layout.slices.Fixed
import org.scalatest.flatspec.AnyFlatSpec
import test._

import scala.concurrent.Future

@DoNotDiscover class IndexPageTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient
    with WithTestApplicationContext
    with ScalaFutures {

  private val pageSize = 10
  private def getIndexPage(path: String, edition: Edition = Uk): Future[Option[IndexPage]] = {
    testContentApiClient
      .getResponse(
        testContentApiClient.item(s"/$path", Uk).pageSize(pageSize).orderBy("newest"),
      )
      .map { item =>
        item.section.map(section =>
          IndexPage(
            page = Section.make(section),
            contents = item.results.getOrElse(Nil).map(IndexPageItem(_)).toSeq,
            tags = Tags(Nil),
            date = DateTime.now,
            tzOverride = None,
          ),
        )
      }
  }

  "Given a page Index, correct containers" should "be created" in {
    val edition = Uk
    val indexPage = getIndexPage("uk/sport", edition)
    whenReady(indexPage) {
      case None =>
        fail("Wrong type (expected: IndexPage, real: Result)")
      case Some(page) =>
        val front = IndexPage.makeFront(page, edition)
        front.containers should not be empty

        val firstContainer = front.containers.head
        val formatter = DateTimeFormat.forPattern("d MMMM yyyy")
        val parsedDate = formatter.parseDateTime(firstContainer.displayName.get)
        parsedDate shouldBe a[DateTime]
        firstContainer.container.isInstanceOf[Fixed] should be(true)
        firstContainer.index should be(0)

        firstContainer.items should not be empty
    }
  }
}
