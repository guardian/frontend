import com.gu.facia.client.models.CollectionConfig
import slices.Container

package object layout {
  implicit class RichCollectionConfig(config: CollectionConfig) {
    /** Hacky helper method to make a copy of the config that resolves to the given container.
      *
      * It would be a lot nicer if we didn't do this but it would require (yet another) refactor of
      * how the Front stuff is constructed, so for now this is a quick way to achieve our goals.
      */
    def withContainer(container: Container) =
      config.copy(`type` = Container.reverseResolve(container))
  }
}
