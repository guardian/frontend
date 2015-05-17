package containers

import com.gu.facia.client.models.CollectionConfigJson
import layout.{CollectionEssentials, FaciaContainer}
import model.{Content, FrontProperties}
import services.CollectionConfigWithId
import slices.{Fixed, TTT, ContainerDefinition, FixedContainers}

trait Containers {

  protected def onwardContainer(dataId: String, trails: Seq[Content]): FaciaContainer = {
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
      CollectionConfigWithId(dataId, config),
      CollectionEssentials(trails, Nil, displayName, None, None, None)
    ).withTimeStamps
  }
}
