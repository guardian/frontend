package layout.slices

import model.pressed.CollectionConfig
import common.Logging
import model.facia.PressedCollection

import scala.collection.immutable.Iterable

object Container extends Logging {
  /** This is THE top level resolver for containers */
  val all: Map[String, Container] = Map(
    ("dynamic/fast", Dynamic(DynamicFast)),
    ("dynamic/slow", Dynamic(DynamicSlow)),
    ("dynamic/package", Dynamic(DynamicPackage)),
    ("dynamic/slow-mpu", Dynamic(DynamicSlowMPU(omitMPU = false))),
    ("dynamic/election", Dynamic(DynamicElection)), // #election2017
    ("fixed/video", Video),
    ("nav/list", NavList),
    ("nav/media-list", NavMediaList),
    ("news/most-popular", MostPopular)
  ) ++
    FixedContainers.all.mapValues(Fixed.apply)

  /** So that we don't blow up at runtime, which would SUCK */
  val default = Fixed(FixedContainers.fixedSmallSlowIV)

  def resolve(id: String): Container = all.getOrElse(id, {
    log.error(s"Could not resolve container id $id, using default container")
    default
  })

  def fromConfig(collectionConfig: CollectionConfig): Container =
    resolve(collectionConfig.collectionType)

  def fromPressedCollection(pressedCollection: PressedCollection, omitMPU: Boolean): Container = {
    val container = resolve(pressedCollection.collectionType)
    container match {
      case Fixed(definition) if omitMPU =>
        Fixed(definition.copy(slices = definition.slicesWithoutMPU))
      case Dynamic(DynamicSlowMPU(_)) if omitMPU =>
        Dynamic(DynamicSlowMPU(omitMPU = true))
      case _ => container
    }
  }

  def showToggle(container: Container): Boolean = container match {
    case NavList | NavMediaList | Video => false
    case _ => true
  }

  def customClasses(container: Container): Iterable[String] = container match {
    case Dynamic(DynamicPackage) => Set("fc-container--story-package")
    case Dynamic(DynamicElection) => Set("fc-container--story-package", "fc-container--election") // #election2017
    case Fixed(fixedContainer) => fixedContainer.customCssClasses
    case _ => Nil
  }
}

sealed trait Container

case class Dynamic(get: DynamicContainer) extends Container
case class Fixed(get: ContainerDefinition) extends Container
case object NavList extends Container
case object NavMediaList extends Container
case object MostPopular extends Container
case object Video extends Container
