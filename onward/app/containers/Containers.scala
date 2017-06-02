package containers

import com.gu.facia.api.{models => fapi}
import com.gu.facia.client.models.CollectionConfigJson
import layout.{CollectionEssentials, FaciaContainer}
import model.FrontProperties
import model.pressed.{PressedContent, CollectionConfig}
import services.CollectionConfigWithId
import slices.{ContainerDefinition, Fixed, FixedContainers, TTT}

trait Containers {

  protected def onwardContainer(dataId: String, trails: Seq[PressedContent]): FaciaContainer = {
    val displayName = Some(dataId)
    val properties = FrontProperties.empty
    val config = CollectionConfigJson.withDefaults(displayName = displayName)

    val containerDefinition = trails.length match {
      case 1 => FixedContainers.fixedSmallSlowI
      case 2 => FixedContainers.fixedSmallSlowII
      case 3 => ContainerDefinition.ofSlices(TTT)
      case _ => FixedContainers.fixedMediumFastXII }

    FaciaContainer(
      1,
      Fixed(containerDefinition),
      CollectionConfigWithId(dataId, CollectionConfig.make(fapi.CollectionConfig.fromCollectionJson(config))),
      CollectionEssentials(trails, Nil, displayName, None, None, None)
    ).withTimeStamps
  }
}
