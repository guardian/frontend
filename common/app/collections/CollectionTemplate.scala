package collections

import model.{Trail, MetaData}
import play.api.templates.Html

trait SliceTemplate {
  val visibleItems: Int

  def render(metaData: MetaData, trail: List[Trail]): Html
}

case class CollectionTemplate(
  sliceTemplates: List[SliceTemplate]
) {
  def visibleItems = sliceTemplates.map(_.visibleItems).sum
}

object Collections {

  val all = Map(
    "news" -> CollectionTemplate(

    )
  )

}

