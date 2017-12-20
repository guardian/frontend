package services

import common.Edition
import common.editions.Uk
import layout.slices.Fixed
import model.{Section, Tags}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import test._
import layout.{Front, FrontPageItem}

import scala.concurrent.Future

@DoNotDiscover class TagPageTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestContentApiClient
  with WithTestApplicationContext
  with ScalaFutures {

  private val pageSize = 10
  private def getTagPage(path: String, edition: Edition = Uk): Future[Option[TagPage]] = {
    testContentApiClient.getResponse(
      testContentApiClient.item(s"/$path", Uk).pageSize(pageSize).orderBy("newest")
    ).map { item =>
      item.section.map(section =>
        TagPage(
          page = Section.make(section),
          contents = item.results.getOrElse(Nil).map(FrontPageItem(_)),
          tags = Tags(Nil),
          date = DateTime.now,
          tzOverride = None
        )
      )
    }
  }

  "Given a page Index, correct containers" should "be created" in {
    val edition = Uk
    val tagPage = getTagPage("uk/sport", edition)
    whenReady(tagPage) {
      case None =>
        fail("Wrong type (expected: TagPage, real: Result)")
      case Some(page) =>
        val front = Front.makeFront(page, edition)
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
