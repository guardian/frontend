package layout

import model.pressed.CollectionConfig
import services.CollectionConfigWithId

case class ContainerDisplayConfig(
  collectionConfigWithId: CollectionConfigWithId,
  showSeriesAndBlogKickers: Boolean
)

object ContainerDisplayConfig {
  val empty = ContainerDisplayConfig(
    CollectionConfigWithId(
      "",
      CollectionConfig.empty
    ),
    false
  )

  def withDefaults(collectionConfigWithId: CollectionConfigWithId): ContainerDisplayConfig = ContainerDisplayConfig(
    collectionConfigWithId,
    false
  )
}
