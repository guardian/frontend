package slices

import model.Trail
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import views.support.TemplateDeduping

class DedupingTest extends FlatSpec with Matchers {

  "Slices" should "dedupe items" in {

    val rawTrails = stubTrails

    implicit val deduping = TemplateDeduping()
    deduping(rawTrails.take(2))

    val (slice, unusedCards) = QuarterQuarterQuarterQuarter(rawTrails)

    val usedTrails = slice.columns.flatMap(_.cards.map(_.item))

    withClue("should ignore the duplicates and take the next available items") {
      usedTrails should be(rawTrails.drop(2).take(4))
    }

    withClue("should return the unused items") {
      unusedCards should have length 16
    }

    withClue("should include deduped items in the unused items") {
      unusedCards.map(_.item.url).take(4) should be (Seq("/item-1", "/item-2", "/item-7", "/item-8"))
    }
  }

  they should "include deduped items if there are not enough unused items" in {

    val rawTrails = stubTrails

    implicit val deduping = TemplateDeduping()

    deduping(rawTrails)

    val (slice, _) = QuarterQuarterQuarterQuarter(rawTrails)

    val usedTrails = slice.columns.flatMap(_.cards.map(_.item))

    withClue("should include deduped items") {
      usedTrails.map(_.url) should be (Seq("/item-1", "/item-2", "/item-3", "/item-4"))
    }
  }

  private def stubTrails: Seq[Trail] = (1 to 20).map{ index =>
    new Trail{

      override def url: String = s"/item-$index"

      override def isLive: Boolean = false
      override def webPublicationDate: DateTime = DateTime.now
      override def section: String = ""
      override def trailText: Option[String] = None
      override def sectionName: String = ""
      override def linkText: String = ""
      override def headline: String = ""
      override def webUrl: String = ""
      override def toString = url
    }
  }
}
