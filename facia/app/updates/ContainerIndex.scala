package updates

import layout.{Mobile, Card, ContainerLayout}
import model.{Content, FaciaPage}
import org.joda.time.DateTime
import play.api.libs.json.Json
import views.support.LatestUpdate

object ContainerIndexItem {
  implicit val jsonWrites = Json.writes[ContainerIndexItem]

  def fromCard(card: Card) = card.item match {
    case content: Content => ContainerIndexItem(
      content.id,
      !card.hideUpTo.exists(_ == Mobile))
  }
}

case class ContainerIndexItem(
  id: String,
  visibleOnMobile: Boolean
)

object ContainerIndex {
  implicit val jsonWrites = Json.writes[ContainerIndex]

  def fromContainerLayout(containerLayout: ContainerLayout, latestUpdate: DateTime) = {
    val items = for {
      slice <- containerLayout.slices
      column <- slice.columns
      card <- column.cards
    } yield ContainerIndexItem.fromCard(card)

    ContainerIndex(items, (items, latestUpdate).hashCode())
  }
}

case class ContainerIndex(
  items: Seq[ContainerIndexItem],
  versionId: Int
)

object FrontIndex {
  implicit val jsonWrites = Json.writes[FrontIndex]

  def fromFaciaPage(faciaPage: FaciaPage): FrontIndex = {
    FrontIndex((CollectionWithLayout.fromFaciaPage(faciaPage) flatMap {
      case CollectionWithLayout(collection, config, maybeLayout) =>
        (for {
          layout <- maybeLayout
          latestUpdate <- LatestUpdate(collection, collection.items)
        } yield ContainerIndex.fromContainerLayout(layout, latestUpdate)).map(config.id -> _)
    }).toMap)
  }
}

case class FrontIndex(containers: Map[String, ContainerIndex])
