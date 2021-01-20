import layout.slices.{ContainerDefinition, FixedContainers}

package object controllers {
  def visuallyPleasingContainerForStories(numberOfStories: Int): ContainerDefinition =
    numberOfStories match {
      case 1 => FixedContainers.fixedSmallSlowI
      case 2 => FixedContainers.fixedSmallSlowII
      case 3 => FixedContainers.slowSeriesIII
      case 4 => FixedContainers.fixedSmallSlowIV
      case 5 => FixedContainers.slowSeriesV
      case 6 => FixedContainers.fixedMediumSlowVI
      case _ => FixedContainers.fixedSmallSlowIV
    }
}
