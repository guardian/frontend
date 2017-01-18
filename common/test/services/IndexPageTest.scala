package services

import common.Edition
import common.editions.Uk
import model.{Section, Tags}
import org.joda.time.DateTime
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
    whenReady(indexPage) { indexPageMaybe =>
      indexPageMaybe match {
        case None =>
          fail("Wrong type (expected: IndexPage, real: Result)")
        case Some(indexPage) =>
          val front = IndexPage.makeFront(indexPage, edition)
          front.containers.length should be(1)

          val firstContainer = front.containers.head
          firstContainer.displayName.get should equal("13 January 2017")
          firstContainer.container.isInstanceOf[Fixed] should be(true)
          firstContainer.index should be(0)
          firstContainer.containerLayout.get.slices.length should be(2)
          firstContainer.containerLayout.get.remainingCards.length should be(1)

          firstContainer.items.length should be(pageSize)
          firstContainer.items.head.header.headline should be("Dave Brailsford appears to be losing his grip as hands spin out of control")
          firstContainer.items.head.header.url should be("/sport/blog/2017/jan/13/dave-brailsford-team-sky-cycling-control")
      }
    }
  }
}
