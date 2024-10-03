package layout.slices

object ScrollableContainers {
  import ContainerDefinition.{ofSlices => slices}
  val all: Map[String, ContainerDefinition] = Map(
    ("scrollable/highlights", slices(Highlights)),
    ("scrollable/small", slices(ScrollableSmall)),
    ("scrollable/medium", slices(ScrollableMedium)),
    ("scrollable/feature", slices(ScrollableFeature)),
  )
}
