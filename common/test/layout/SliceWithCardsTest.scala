package layout

import com.gu.facia.client.models.CollectionConfig
import model.{FaciaImageElement, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Imports
import org.scalatest.prop.GeneratorDrivenPropertyChecks
import org.scalatest.{Matchers, FlatSpec}
import slices.DesktopBehaviour

class SliceWithCardsTest extends FlatSpec with Matchers with GeneratorDrivenPropertyChecks {
  val NumberOfFixtures = 40

  val cardFixtures = (1 to NumberOfFixtures) map { n => IndexedTrail(new Trail {
      override def webPublicationDate: Imports.DateTime = DateTime.now

      override def url: String = ""

      override def isLive: Boolean = false

      override def section: String = ""

      override def trailText: Option[String] = None

      //sectionId
      override def sectionName: String = ""

      override def linkText: String = ""

      override def headline: String = ""

      override def webUrl: String = ""

      override def customImageCutout: Option[FaciaImageElement] = None
    }, n)
  }

  "a slice" should "consume as many items as the columns it aggregates consume" in {
    forAll { (layout: SliceLayout) =>
      SliceWithCards.fromItems(
        cardFixtures,
        layout,
        ContainerLayoutContext.empty,
        CollectionConfig.emptyConfig,
        DesktopBehaviour
      )._2.length shouldEqual
        (0 max (NumberOfFixtures - layout.columns.map(SliceWithCards.itemsToConsume).sum))
    }
  }

  it should "never reorder, duplicate or lose items" in {
    forAll { (layout: SliceLayout) =>
      val (slice, remaining, _) = SliceWithCards.fromItems(
        cardFixtures,
        layout,
        ContainerLayoutContext.empty,
        CollectionConfig.emptyConfig,
        DesktopBehaviour
      )

      slice.columns.map(_.cards).flatten ++ remaining shouldEqual cardFixtures
    }
  }

  it should "never couple more items with a column than it can consume" in {
    forAll { (layout: SliceLayout) =>
      val slice = SliceWithCards.fromItems(
        cardFixtures,
        layout,
        ContainerLayoutContext.empty,
        CollectionConfig.emptyConfig,
        DesktopBehaviour
      )._1

      for (column <- slice.columns) {
        column.cards.length should be <= SliceWithCards.itemsToConsume(column.column)
      }
    }
  }
}
