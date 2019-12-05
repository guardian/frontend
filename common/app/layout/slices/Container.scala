package layout.slices

import model.pressed.{CollectionConfig, PressedContent}
import common.Logging
import layout.{EmailContentContainer, Front}
import model.facia.PressedCollection

import scala.collection.immutable.Iterable

object Container extends Logging {
  /** This is THE top level resolver for containers */
  def all(adFree: Boolean = false): Map[String, Container] = Map(
    ("dynamic/fast", Dynamic(DynamicFast)),
    ("dynamic/slow", Dynamic(DynamicSlow)),
    ("dynamic/package", Dynamic(DynamicPackage)),
    ("dynamic/slow-mpu", Dynamic(DynamicSlowMPU(omitMPU = false, adFree = adFree))),
    ("fixed/video", Video),
    ("nav/list", NavList),
    ("nav/media-list", NavMediaList),
    ("news/most-popular", MostPopular)
  ) ++ FixedContainers.all.mapValues(Fixed.apply) ++ EmailLayouts.all.mapValues(Email.apply)


  /** So that we don't blow up at runtime, which would SUCK */
  val default = Fixed(FixedContainers.fixedSmallSlowIV)

  def resolve(id: String, adFree: Boolean = false): Container = all(adFree).getOrElse(id, default)

  def fromConfig(collectionConfig: CollectionConfig): Container =
    resolve(collectionConfig.collectionType)

  def storiesCount(collectionConfig: CollectionConfig, items: Seq[PressedContent]): Option[Int] = {
    resolve(collectionConfig.collectionType) match {
      case Dynamic(dynamicContainer) => dynamicContainer
        .slicesFor(items.map(Story.fromFaciaContent))
        .map(Front.itemsVisible)
      case Fixed(fixedContainer) => Some(Front.itemsVisible(fixedContainer.slices))
      case Email(_) => Some(EmailContentContainer.storiesCount(collectionConfig))
      case _ => None
    }
  }

  def affectsDuplicates(collectionType: String): Boolean = {
    resolve(collectionType) match {
      case Fixed(fixedContainer) if !fixedContainer.isSingleton => true
      case Dynamic(_) => true
      case Email(_) => true
      case _ => false
    }
  }

  def affectedByDuplicates(collectionType: String): Boolean = {
    resolve(collectionType) match {
      case Fixed(fixedContainer) if !fixedContainer.isSingleton => true
      case Email(_) => true
      case _ => false
    }
  }

  def fromPressedCollection(pressedCollection: PressedCollection, omitMPU: Boolean, adFree: Boolean): Container = {
    val container = resolve(pressedCollection.collectionType, adFree)
    container match {
      case Fixed(definition) if omitMPU || adFree =>
        Fixed(definition.copy(slices = definition.slicesWithoutMPU))
      case Dynamic(DynamicSlowMPU(_,_)) if omitMPU || adFree =>
        Dynamic(DynamicSlowMPU(omitMPU, adFree))
      case _ => container
    }
  }

  def showToggle(container: Container): Boolean = container match {
    case NavList | NavMediaList => false
    case _ => true
  }

  def customClasses(container: Container): Iterable[String] = container match {
    case Dynamic(DynamicPackage) => Set("fc-container--story-package")
    case Fixed(fixedContainer) => fixedContainer.customCssClasses
    case _ => Nil
  }
}

sealed trait Container

case class Dynamic(get: DynamicContainer) extends Container
case class Fixed(get: ContainerDefinition) extends Container
case class Email(get: EmailLayout) extends Container
case object NavList extends Container
case object NavMediaList extends Container
case object MostPopular extends Container
case object Video extends Container
