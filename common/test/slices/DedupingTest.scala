package slices

import layout.ContainerLayout
import model.{ApiContentWithMeta, Content, Collection}
import org.scalatest.{FlatSpec, Matchers}
import views.support.TemplateDeduping
import com.gu.openplatform.contentapi.model.{Content => ApiContent}

class DedupingTest extends FlatSpec with Matchers {
  val containerFixture = ContainerDefinition(Seq(QuarterQuarterQuarterQuarter), RestrictTo(6))

  "Slices" should "dedupe items" in {
    val rawTrails = stubTrails

    implicit val deduping = TemplateDeduping()
    deduping(rawTrails.take(2))

    val ContainerLayout(slices, unusedCards) = ContainerLayout(
      containerFixture,
      Collection(rawTrails.toSeq),
      deduping
    )

    val usedTrails = slices.flatMap(_.columns.flatMap(_.cards.map(_.item)))

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

    val ContainerLayout(slices, unusedCards) = ContainerLayout(
      containerFixture,
      Collection(rawTrails.toSeq),
      deduping
    )

    val usedTrails = slices.flatMap(_.columns.flatMap(_.cards.map(_.item)))

    withClue("should include deduped items") {
      usedTrails.map(_.url) should be (Seq("/item-1", "/item-2", "/item-3", "/item-4"))
    }
  }

  private def stubTrails: Seq[Content] = (1 to 20) map { index =>
    Content(ApiContentWithMeta(
      ApiContent(
        s"item-$index",
        None,
        None,
        None,
        "",
        "",
        "",
        None,
        Nil,
        Nil,
        Nil,
        None
      )
    ))
  }
}
