package views.support

import model.{Collection, Trail}
import scala.collection.mutable

class TemplateDeduping extends implicits.Collections {
  private val alreadyUsed: mutable.HashSet[String] = new mutable.HashSet[String]()
  private val defaultTake: Int = 20

  def take(numberWanted: Int, items: Seq[Trail]): Seq[Trail] =
    items
      .distinctBy{_.url}
      .filterNot(t => alreadyUsed.contains(t.url))
      .take(numberWanted)
      .map {trail =>
        alreadyUsed += trail.url
        trail
      }

  def take(numberWanted: Int, collection: Collection): Collection =
    collection.copy(items = take(numberWanted, collection.items))

  def apply(numberWanted: Int, collection: Collection): Collection = take(numberWanted, collection)
  def apply(collection: Collection): Collection = take(defaultTake, collection)
}

object TemplateDeduping {
  def apply(): TemplateDeduping = new TemplateDeduping
}
