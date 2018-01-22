package services

import java.time.ZoneOffset
import java.util.UUID

import model.{Content, ContentType}
import org.joda.time.{DateTime, DateTimeZone, LocalDate}
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import contentapi.FixtureTemplates.emptyApiContent
import IndexPageGrouping.fromContent
import common.JodaTime._
import test.ConfiguredTestSuite
import implicits.Dates.jodaToJavaInstant
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime

@DoNotDiscover class IndexPageGroupingTest extends FlatSpec with Matchers with ConfiguredTestSuite {
  val timeZone = DateTimeZone.forOffsetHours(0)

  def makeFixture(dateTime: DateTime): ContentType = Content(
    emptyApiContent.copy(
      id = UUID.randomUUID().toString, webPublicationDate = Some(jodaToJavaInstant(dateTime).atOffset(ZoneOffset.UTC).toCapiDateTime)
    )
  )

  "fromContent" should "pop content out into days if there is an average of 2 or more items of content per day" in {
    val fixtures = Seq(
      makeFixture(new DateTime(1987, 2, 5, 12, 0, 0, timeZone)),
      makeFixture(new DateTime(1987, 2, 5, 13, 0, 0, timeZone))
    )

    fromContent(fixtures.map(_.content), timeZone) shouldEqual Seq(
      Day(
        new LocalDate(1987, 2, 5),
        fixtures.sortBy(_.trail.webPublicationDate).reverse.map(_.content)
      )
    )
  }

  it should "otherwise group items by month" in {
    val fixtures = Seq(
      makeFixture(new DateTime(1987, 2, 5, 12, 0, 0, timeZone)),
      makeFixture(new DateTime(1987, 2, 6, 13, 0, 0, timeZone))
    )

    fromContent(fixtures.map(_.content), timeZone) shouldEqual Seq(
      Month(
        new LocalDate(1987, 2, 1),
        fixtures.sortBy(_.trail.webPublicationDate).reverse.map(_.content)
      )
    )
  }
}
