package layout

import model.Trail
import org.scala_tools.time.Imports
import org.scalatest.prop.GeneratorDrivenPropertyChecks
import org.scalatest.{Matchers, FlatSpec}

class SliceWithCardsTest extends FlatSpec with Matchers with GeneratorDrivenPropertyChecks {
  val NumberOfFixtures = 40

  val cardFixtures = (1 to NumberOfFixtures) map { n => Card(n, new Trail {
      override def webPublicationDate: Imports.DateTime = ???

      override def url: String = ???

      override def isLive: Boolean = ???

      override def section: String = ???

      override def trailText: Option[String] = ???

      //sectionId
      override def sectionName: String = ???

      override def linkText: String = ???

      override def headline: String = ???

      override def webUrl: String = ???
    })
  }

  "a slice" should "consume as many items as the columns it aggregates consume" in {
    forAll { (layout: SliceLayout) =>
      SliceWithCards.fromItems(cardFixtures, layout)._2.length shouldEqual
        NumberOfFixtures - layout.columns.map(SliceWithCards.itemsToConsume).sum
    }
  }

  it should "never reorder, duplicate or lose items" in {
    forAll { (layout: SliceLayout) =>
      val (slice, remaining) = SliceWithCards.fromItems(cardFixtures, layout)

      slice.columns.map(_.cards).flatten ++ remaining shouldEqual cardFixtures
    }
  }

  it should "never couple more items with a column than it can consume" in {
    forAll { (layout: SliceLayout) =>
      val slice = SliceWithCards.fromItems(cardFixtures, layout)._1

      for (column <- slice.columns) {
        column.cards.length should be <= SliceWithCards.itemsToConsume(column.column)
      }
    }
  }
}
