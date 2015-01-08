package slices

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import common.Logging

object Container extends Logging {
  /** This is THE top level resolver for containers */
  val all: Map[String, Container] = Map(
    ("dynamic/fast", Dynamic(DynamicFast)),
    ("dynamic/slow", Dynamic(DynamicSlow)),
    ("nav/list", NavList),
    ("nav/media-list", NavMediaList),
    ("news/most-popular", MostPopular)
  ) ++ FixedContainers.all.mapValues(Fixed.apply)

  /** So that we don't blow up at runtime, which would SUCK */
  val default = Fixed(FixedContainers.fixedSmallSlowIV)

  def resolve(id: String) = all.getOrElse(id, {
    log.error(s"Could not resolve container id $id, using default container")
    default
  })

  def fromConfig(collectionConfig: CollectionConfig) =
    collectionConfig.collectionType.map(resolve).getOrElse(default)

  def showToggle(container: Container) = container match {
    case NavList | NavMediaList => false
    case _ => true
  }

  def customClasses(container: Container) = container match {
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
