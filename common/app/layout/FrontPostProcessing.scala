package layout

import scalaz.Traverse
import scalaz.std.list._
import scalaz.std.option._

object FrontPostProcessing {
  type Structure[A] = List[Option[List[List[List[A]]]]]

  private def setStructure(front: Front, structure: Structure[FaciaCard]) = {
    front.copy(containers = (front.containers zip structure) map { case (containerAndCollection, structure1) =>
      containerAndCollection.copy(containerLayout =
        ((containerAndCollection.containerLayout zip structure1) map { case (layout, structure2) =>
          ContainerLayoutPostProcessing.setStructure(layout, structure2)
        }).headOption
      )
    })
  }

  private def getStructure(front: Front): Structure[FaciaCard] = front.containers.toList.map(
    _.containerLayout.map(ContainerLayoutPostProcessing.getStructure)
  )

  implicit val layoutStructureTraverse =
    Traverse[List] compose
      Traverse[Option] compose
      Traverse[List] compose
      Traverse[List] compose
      Traverse[List]

  def deduplicateCutouts(front: Front): Front =
    setStructure(front, CutOutDeduplication[Structure](getStructure(front)))
}
