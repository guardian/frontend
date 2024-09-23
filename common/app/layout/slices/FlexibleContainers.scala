package layout.slices

import model.pressed.PressedContent

object FlexibleContainers {
  val all: Map[String, FlexibleContainer] = Map(
    ("flexible/special", FlexibleSpecial),
    ("flexible/general", FlexibleGeneral),

  )

  def apply(collectionType: Option[String], items: Seq[PressedContent]): Option[ContainerDefinition] = {
    for {
      typ <- collectionType
      flexibleContainer <- all.get(typ)
      definition <- flexibleContainer.containerDefinitionFor(items.map(Story.fromFaciaContent))
    } yield definition
  }
}
