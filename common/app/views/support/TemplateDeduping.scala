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

  def apply(numberWanted: Int, collection: Collection): Seq[Trail] = take(numberWanted, collection.items)
  def apply(collection: Collection): Seq[Trail] = take(collection.items.length, collection.items)

  def apply(numberWanted: Int, items: Seq[Trail]): Seq[Trail] = take(numberWanted, items)
  def apply(items: Seq[Trail]): Seq[Trail] = take(items.length, items)
}

object TemplateDeduping {
  def apply(): TemplateDeduping = new TemplateDeduping
}
