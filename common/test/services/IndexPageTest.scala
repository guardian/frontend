package services

import common.Edition
import common.editions.Uk
import model.{Section, Tags}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import slices.Fixed
import test._

import scala.concurrent.Future

@DoNotDiscover class IndexPageTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestContentApiClient
  with WithTestContext
  with ScalaFutures {

  private val pageSize = 10
  private def getIndexPage(path: String, edition: Edition = Uk): Future[Option[IndexPage]] = {
    testContentApiClient.getResponse(
      testContentApiClient.item(s"/$path", Uk).pageSize(pageSize).orderBy("newest")
    ).map { item =>
      item.section.map(section =>
        IndexPage(
          page = Section.make(section),
          contents = item.results.getOrElse(Nil).map(IndexPageItem(_)),
          tags = Tags(Nil),
          date = DateTime.now,
          tzOverride = None
        )
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
        front.containers.length should be(1)

        val firstContainer = front.containers.head
        val formatter = DateTimeFormat.forPattern("d MMMM yyyy")
        val parsedDate = formatter.parseDateTime(firstContainer.displayName.get)
        parsedDate shouldBe a[DateTime]
        firstContainer.container.isInstanceOf[Fixed] should be(true)
        firstContainer.index should be(0)
        firstContainer.containerLayout.get.slices.length should be(2)
        firstContainer.containerLayout.get.remainingCards.length should be(1)

        firstContainer.items.length should be(pageSize)
        firstContainer.items.head.header.headline should be("Rio 2016 Olympic venues abandoned and derelict six months after Games – video")
        firstContainer.items.head.header.url should be("/sport/video/2017/feb/10/rio-2016-olympic-venues-abandoned-derelict-video")
    }
  }
}
