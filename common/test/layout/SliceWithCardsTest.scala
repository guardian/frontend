package layout

import com.gu.contentapi.client.model.{Content => ApiContent}
import com.gu.facia.api.models.CollectionConfig
import model.{Content, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Imports
import org.scalatest.prop.GeneratorDrivenPropertyChecks
import org.scalatest.{FlatSpec, Matchers}
import services.FaciaContentConvert
import slices.DesktopBehaviour

class SliceWithCardsTest extends FlatSpec with Matchers with GeneratorDrivenPropertyChecks {
  val NumberOfFixtures = 40

  def nthApiContent(n: Int): ApiContent = ApiContent(
    id = "id",
    sectionId = None,
    sectionName = None,
    webPublicationDateOption = Option(DateTime.now()),
    webTitle = "",
    webUrl = s"$n",
    apiUrl = s"$n",
    fields = None,
    tags = Nil,
    elements = None,
    references = Nil,
    isExpired = None)

  val cardFixtures = (1 to NumberOfFixtures) map { n =>
    IndexedTrail(FaciaContentConvert.frontendContentToFaciaContent(
      new Content(
        nthApiContent(n)) {
          override lazy val webPublicationDate: Imports.DateTime = DateTime.now

          override lazy val url: String = s"$n"

          override lazy val isLive: Boolean = false

          override lazy val section: String = ""

          override lazy val trailText: Option[String] = None

          //sectionId
          override lazy val sectionName: String = ""

          override lazy val linkText: String = ""

          override lazy val headline: String = ""

          override lazy val webUrl: String = s"$n"
      }), n)
  }

  "a slice" should "consume as many items as the columns it aggregates consume" in {
    forAll { (layout: SliceLayout) =>
      SliceWithCards.fromItems(
        cardFixtures,
        layout,
        ContainerLayoutContext.empty,
        CollectionConfig.empty,
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
        CollectionConfig.empty,
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
        CollectionConfig.empty,
        DesktopBehaviour,
        showSeriesAndBlogKickers = false
      )._1

      for (column <- slice.columns) {
        column.cards.length should be <= column.column.numItems
      }
    }
  }
}
