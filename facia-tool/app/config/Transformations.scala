package config

import controllers.CreateFront
import frontsapi.model.{Collection, Front, Config}

object Transformations {
  /** The Config ought never to contain empty fronts or collections that do not belong to any fronts */
  def prune(config: Config): Config = {
    val emptyFronts = config.fronts.filter(_._2.collections.isEmpty).map(_._1)
    val collectionIdsReferencedInFronts = config.fronts.values.flatMap(_.collections).toSet
    val orphanedCollections = config.collections.keySet -- collectionIdsReferencedInFronts

    config.copy(
      config.fronts -- emptyFronts,
      config.collections -- orphanedCollections
    )
  }

  def createFront(createCommand: CreateFront, newCollectionId: String)(config: Config): Config = {
    val newFront = Front(
      collections =       List(newCollectionId),
      navSection =        createCommand.navSection,
      webTitle =          createCommand.webTitle,
      title =             createCommand.title,
      description =       createCommand.description,
      onPageDescription = createCommand.onPageDescription,
      imageUrl =          createCommand.imageUrl,
      imageWidth =        createCommand.imageWidth,
      imageHeight =       createCommand.imageHeight,
      isImageDisplayed =  createCommand.isImageDisplayed,
      isHidden =          createCommand.isHidden,
      priority =          createCommand.priority
    )

    config.copy(
      fronts = config.fronts + (createCommand.id -> newFront),
      collections = config.collections + (newCollectionId -> createCommand.initialCollection)
    )
  }

  def updateFront(frontId: String, front: Front)(config: Config): Config = {
    config.copy(fronts = config.fronts + (frontId -> front))
  }

  def updateCollection(
      frontIds: List[String],
      collectionId: String,
      collection: Collection
  )(config: Config): Config = {
    val updatedFronts = frontIds flatMap { frontId =>
      config.fronts.get(frontId) map { front =>
        frontId -> front.copy(collections = (front.collections ++ List(collectionId)).distinct)
      }
    }

    config.copy(
      fronts = config.fronts ++ updatedFronts,
      collections = config.collections + (collectionId -> collection)
    )
  }
}
