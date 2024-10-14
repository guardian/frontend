package layout.slices

import model.pressed.PressedContent

object DynamicContainers {
  val all: Map[String, DynamicContainer] = Map(
    ("dynamic/fast", DynamicFast),
    ("dynamic/slow", DynamicSlow),
    ("dynamic/package", DynamicPackage),
    ("dynamic/slow-mpu", DynamicSlowMPU(omitMPU = false, adFree = false)),
  )

  def apply(collectionType: Option[String], items: Seq[PressedContent]): Option[ContainerDefinition] = {
    for {
      typ <- collectionType
      dynamicContainer <- all.get(typ)
      definition <- dynamicContainer.containerDefinitionFor(items.map(Story.fromFaciaContent))
    } yield definition
  }
}
