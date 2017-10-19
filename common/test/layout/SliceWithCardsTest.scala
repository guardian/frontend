package layout

import java.time.ZoneOffset

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import implicits.Dates.jodaToJavaInstant
import model.pressed.CollectionConfig
import org.joda.time.DateTime
import org.scalatest.prop.GeneratorDrivenPropertyChecks
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import services.FaciaContentConvert
import slices.DesktopBehaviour

class SliceWithCardsTest extends FlatSpec with Matchers with GeneratorDrivenPropertyChecks with GuiceOneAppPerSuite {
  val NumberOfFixtures = 40

  def nthApiContent(n: Int): ApiContent = ApiContent(
    id = "id",
    sectionId = None,
    sectionName = None,
    webPublicationDate = Some((jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC)).toCapiDateTime),
    webTitle = "",
    webUrl = s"$n",
    apiUrl = s"$n",
    fields = None,
    tags = Nil,
    elements = None,
    references = Nil,
    isExpired = None)

  lazy val cardFixtures = (1 to NumberOfFixtures) map { n =>
    IndexedTrail(FaciaContentConvert.contentToFaciaContent(nthApiContent(n)), n)
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

      slice.columns.flatMap(_.cards).map(_.index) ++ remaining.map(_.index) shouldEqual cardFixtures.map(_.index)
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
