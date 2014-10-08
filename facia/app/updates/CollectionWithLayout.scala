package updates

import layout.ContainerLayout
import model.{Collection, FaciaPage, Config}
import slices.{DynamicContainers, FixedContainers}
import views.support.TemplateDeduping

object CollectionWithLayout {
  /** TODO once old containers are gone refactor this and frontCollection.scala.html to remove duplication */
  def fromFaciaPage(faciaPage: FaciaPage): List[CollectionWithLayout] = {
    val templateDeduping = new TemplateDeduping

    def containerLayout(config: Config, collection: Collection): Option[ContainerLayout] = {
      val fixedLayout = FixedContainers.unapply(config.collectionType) map { containerDefinition =>
        ContainerLayout(containerDefinition, collection, Some(templateDeduping))
      }

      fixedLayout orElse (DynamicContainers(config.collectionType, collection.items) map { containerDefinition =>
        ContainerLayout(containerDefinition, collection, None)
      })
    }

    for {
      (config, collection) <- faciaPage.collections
    } yield CollectionWithLayout(collection, config, containerLayout(config, collection))
  }
}

case class CollectionWithLayout(
  collection: Collection,
  config: Config,
  layout: Option[ContainerLayout]
)
