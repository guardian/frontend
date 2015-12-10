package layout

import model.pressed.CollectionConfig
import services.CollectionConfigWithId

object ContainerDisplayConfig {
  val empty = ContainerDisplayConfig(
    CollectionConfigWithId(
      "",
      CollectionConfig.empty
    ),
    false
  )

  def withDefaults(collectionConfigWithId: CollectionConfigWithId) = ContainerDisplayConfig(
    collectionConfigWithId,
    false
  )
}

case class ContainerDisplayConfig(
  collectionConfigWithId: CollectionConfigWithId,
  showSeriesAndBlogKickers: Boolean
)
