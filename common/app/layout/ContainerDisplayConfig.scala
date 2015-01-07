package layout

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import services.CollectionConfigWithId

object ContainerDisplayConfig {
  val empty = ContainerDisplayConfig(
    CollectionConfigWithId(
      "",
      CollectionConfig.emptyConfig
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
