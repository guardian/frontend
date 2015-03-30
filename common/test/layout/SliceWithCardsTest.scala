package layout

import com.gu.facia.client.models.CollectionConfigJson
import model.{Content, FaciaImageElement, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Imports
import org.scalatest.prop.GeneratorDrivenPropertyChecks
import org.scalatest.{Matchers, FlatSpec}
import slices.DesktopBehaviour

class SliceWithCardsTest extends FlatSpec with Matchers with GeneratorDrivenPropertyChecks {
  val NumberOfFixtures = 40

  val cardFixtures = (1 to NumberOfFixtures) map { n => IndexedTrail(new Trail {
      override def webPublicationDate: Imports.DateTime = DateTime.now

      override def url: String = s"$n"

      override def isLive: Boolean = false

      override def section: String = ""

      override def trailText: Option[String] = None

      //sectionId
      override def sectionName: String = ""

      override def linkText: String = ""

      override def headline: String = ""

      override def webUrl: String = s"$n"

      override def customImageCutout: Option[FaciaImageElement] = None

    override def snapType: Option[String] = None

    override def snapUri: Option[String] = None
  }, n)
  }

  "a slice" should "consume as many items as the columns it aggregates consume" in {
    forAll { (layout: SliceLayout) =>
      SliceWithCards.fromItems(
        cardFixtures,
        layout,
        ContainerLayoutContext.empty,
        CollectionConfigJson.emptyConfig,
        DesktopBehaviour,
        showSeriesAndBlogKickers = false
      )._2.length shouldEqual
        (0 max (NumberOfFixtures - layout.columns.map(_.numItems).sum))
    }
  }

  it should "never reorder, duplicate or lose items" in {
    forAll { (layout: SliceLayout) =>
      val (slice, remaining, _) = SliceWithCards.fromItems(
        cardFixtures,
        layout,
        ContainerLayoutContext.empty,
        CollectionConfigJson.emptyConfig,
        DesktopBehaviour,
        showSeriesAndBlogKickers = false
      )

      def idFromTrail(trail: Trail) = trail match {
        case c: Content => Some(c.id)
        case _ => None
      }

      slice.columns.map(_.cards).flatten.map(_.index) ++ remaining.map(_.index) shouldEqual cardFixtures.map(_.index)
    }
  }

  it should "never couple more items with a column than it can consume" in {
    forAll { (layout: SliceLayout) =>
      val slice = SliceWithCards.fromItems(
        cardFixtures,
        layout,
        ContainerLayoutContext.empty,
        CollectionConfigJson.emptyConfig,
        DesktopBehaviour,
        showSeriesAndBlogKickers = false
      )._1

      for (column <- slice.columns) {
        column.cards.length should be <= column.column.numItems
      }
    }
  }
}
