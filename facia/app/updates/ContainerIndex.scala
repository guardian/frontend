package updates

import layout.{Mobile, Card, ContainerLayout}
import model.{Content, Config, Collection, FaciaPage}
import org.joda.time.DateTime
import play.api.libs.json.Json
import slices.{DynamicContainers, FixedContainers}
import views.support.{LatestUpdate, TemplateDeduping}

object ContainerIndexItem {
  implicit val jsonWrites = Json.writes[ContainerIndexItem]

  def fromCard(card: Card) = ContainerIndexItem(
    card.item match {
      case content: Content => content.id
    },
    !card.hideUpTo.exists(_ == Mobile)
  )
}

case class ContainerIndexItem(
  id: String,
  visibleOnMobile: Boolean
)

object ContainerIndex {
  implicit val jsonWrites = Json.writes[ContainerIndex]

  def fromContainerLayout(containerLayout: ContainerLayout, latestUpdate: DateTime) = {
    ContainerIndex(latestUpdate, for {
      slice <- containerLayout.slices
      column <- slice.columns
      card <- column.cards
    } yield ContainerIndexItem.fromCard(card))
  }
}

case class ContainerIndex(
  updated: DateTime,
  items: Seq[ContainerIndexItem]
)

object FrontIndex {
  implicit val jsonWrites = Json.writes[FrontIndex]

  /** TODO once old containers are gone refactor this and frontCollection.scala.html to remove duplication */
  def fromFaciaPage(faciaPage: FaciaPage): FrontIndex = {
    val templateDeduping = new TemplateDeduping

    def containerLayout(config: Config, collection: Collection): Option[ContainerLayout] = {
      val fixedLayout = FixedContainers.unapply(config.collectionType) map { containerDefinition =>
        ContainerLayout(containerDefinition, collection, Some(templateDeduping))
      }

      fixedLayout orElse (DynamicContainers(config.collectionType, collection.items) map { containerDefinition =>
        ContainerLayout(containerDefinition, collection, None)
      })
    }

    FrontIndex((faciaPage.collections flatMap { case (config, collection) =>
      (for {
        layout <- containerLayout(config, collection)
        latestUpdate <- LatestUpdate(collection, collection.items)
      } yield ContainerIndex.fromContainerLayout(layout, latestUpdate)).map(config.id -> _)
    }).toMap)
  }
}

case class FrontIndex(containers: Map[String, ContainerIndex])
