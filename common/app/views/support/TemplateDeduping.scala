package views.support

import model.{Collection, Trail}
import scala.collection.mutable

class TemplateDeduping extends implicits.Collections {
  private val alreadyUsed: mutable.HashSet[String] = new mutable.HashSet[String]()

  def take(numberWanted: Int, items: Seq[Trail]): Seq[Trail] = {
    val thisRound = items filterNot (t => alreadyUsed.contains(t.url)) take numberWanted
    val returnList = thisRound ++ {thisRound.lastOption.map(t => items.dropWhile(_ != t).drop(1)).getOrElse(Nil)}
    thisRound foreach (alreadyUsed += _.url)
    returnList.distinctBy(_.url)
  }

  def take(numberWanted: Int, collection: Collection): Collection =
    collection.copy(items = take(numberWanted, collection.items))

  def apply(numberWanted: Int, collection: Collection): Collection = take(numberWanted, collection)
  def apply(collection: Collection): Collection = take(collection.items.length, collection)
}

object TemplateDeduping {
  def apply(): TemplateDeduping = new TemplateDeduping
}
