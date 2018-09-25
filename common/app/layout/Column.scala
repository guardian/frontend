package layout

import cards.{CardType, ListItem, MediaList, Standard}
import model.pressed.CollectionConfig
import play.twirl.api.Html
import slices.{MobileShowMore, RestrictTo}
import scala.annotation.tailrec

object ItemClasses {
  val showMore = ItemClasses(mobile = ListItem, tablet = ListItem)

  val liveBlogMore = ItemClasses(mobile = MediaList, tablet = Standard)
}

case class ItemClasses(mobile: CardType, tablet: CardType, desktop: Option[CardType] = None) {
  /** Template helper */
  def classes: String = s"fc-item--${mobile.cssClassName}-mobile fc-item--${tablet.cssClassName}-tablet" +
    desktop.map(d => s" fc-item--${d.cssClassName}-desktop").getOrElse("")

  def allTypes: Set[CardType] = Set(mobile, tablet) ++ desktop.toSet

  def showVideoPlayer: Boolean = allTypes.exists(_.videoPlayer.show)
  def showVideoEndSlate: Boolean = allTypes.exists(_.videoPlayer.showEndSlate)
  def showYouTubeMediaAtomPlayer: Boolean = allTypes.exists(_.youTubeMediaAtomPlayer.show)
  def showYouTubeMediaAtomEndSlate: Boolean = allTypes.exists(_.youTubeMediaAtomPlayer.showEndSlate)
  def showCutOut: Boolean = allTypes.exists(_.showCutOut)
  def canShowSlideshow: Boolean = allTypes.exists(_.canShowSlideshow)
}
case class SliceLayout(cssClassName: String, columns: Seq[Column]) {
  def numItems: Int = columns.map(_.numItems).sum
}

object Column {
  def cardStyle(column: Column, index: Int): Option[ItemClasses] = column match {
    case SingleItem(_, itemClasses) => Some(itemClasses)
    case Rows(_, _, _, itemClasses) => Some(itemClasses)
    case SplitColumn(_, topItemRows, top, _, _) if topItemRows > index => Some(top)
    case SplitColumn(_, _, _, _, bottom) => Some(bottom)
    case _ => None
  }
}

sealed trait Column {
  def numItems: Int
  def colSpan: Int
}

case class SingleItem(colSpan: Int, itemClasses: ItemClasses) extends Column {
  val numItems: Int = 1
}
case class Rows(colSpan: Int, columns: Int, rows: Int, itemClasses: ItemClasses) extends Column {
  val numItems: Int = columns * rows
}
case class SplitColumn(colSpan: Int, topItemRows: Int, topItemClasses: ItemClasses, bottomItemRows: Int, bottomItemsClasses: ItemClasses) extends Column {
  val numItems: Int = topItemRows + bottomItemRows
}
case class MPU(colSpan: Int) extends Column {
  val numItems: Int = 0
}

case class HtmlAndClasses(index: Int, html: Html, classes: Seq[String])

object SliceWithCards {
  def fromBlobs(layout: SliceLayout, blobs: Seq[HtmlAndClasses]): SliceWithCards = {

    @tailrec
    def columnsWithCards(columns: List[Column],
                         items: Seq[HtmlAndClasses],
                         accumulation: Vector[ColumnAndCards] = Vector.empty
                        ): Seq[ColumnAndCards] = {

      columns match {
        case Nil => accumulation
        case column :: remainingColumns =>
          val (itemsForColumn, itemsNotConsumed) = items splitAt column.numItems

          val columnAndCards = ColumnAndCards(column, itemsForColumn.zipWithIndex map {
            case (HtmlAndClasses(index, html, classes), positionInColumn) =>
              FaciaCardAndIndex(
                index,
                HtmlBlob(html, classes, Column.cardStyle(column, positionInColumn).getOrElse(ItemClasses.showMore)),
                None
              )
          })
          columnsWithCards(remainingColumns, itemsNotConsumed, accumulation :+ columnAndCards)
      }

    }

    SliceWithCards(
      layout.cssClassName,
      columnsWithCards(layout.columns.toList, blobs)
    )
  }

  /** The slice with cards assigned to columns, and the remaining cards that were not consumed, and the new
    * context for creating further cards.
    */
  def fromItems(
    items: Seq[IndexedTrail],
    layout: SliceLayout,
    context: ContainerLayoutContext,
    config: CollectionConfig,
    mobileShowMore: MobileShowMore,
    showSeriesAndBlogKickers: Boolean
  ): (SliceWithCards, Seq[IndexedTrail], ContainerLayoutContext) = {
    val (columns, unconsumed, endContext) = layout.columns.foldLeft((Seq.empty[ColumnAndCards], items, context)) {
      case ((acc, itemsRemaining, currentContext), column) =>
        val (itemsForColumn, itemsNotConsumed) = itemsRemaining splitAt column.numItems

        val (finalContext, cards) = itemsForColumn.zipWithIndex.foldLeft((currentContext, Seq.empty[FaciaCardAndIndex])) {
          case ((contextSoFar, accumulator), (IndexedTrail(trail, index), positionInColumn)) =>
            val (card, contextForNext) = contextSoFar.transform(
              FaciaCardAndIndex(
                index,
                FaciaCard.fromTrail(
                  trail,
                  config,
                  Column.cardStyle(column, positionInColumn).getOrElse(ItemClasses.showMore),
                  showSeriesAndBlogKickers
                ),
                mobileShowMore match {
                  case RestrictTo(nToShowOnMobile) if index >= nToShowOnMobile => Some(Mobile)
                  case _ => None
                }
              )
            )

            (contextForNext, accumulator :+ card)
        }

        (acc :+ ColumnAndCards(column, cards), itemsNotConsumed, finalContext)
    }

    (SliceWithCards(layout.cssClassName, columns), unconsumed, endContext)
  }
}

case class SliceWithCards(cssClassName: String, columns: Seq[ColumnAndCards]) {
  //Get 1st ColumnAndCards
  def test(): Option[ContentCard] = {
    val allCards = for {
      column <- columns
      card <- column.cards
    } yield card.item

    allCards.collectFirst { case c: ContentCard => c }
  }

  def numberOfItems: Int = (columns map { columnAndCards: ColumnAndCards =>
    columnAndCards.column match {
      case Rows(_, cols, _, _) => cols
      case _ => 1
    }
  }).sum

  def numberOfCols: Int = (columns map { columnAndCards: ColumnAndCards =>
    columnAndCards.column.colSpan
  }).sum

  def transformCards(f: ContentCard => ContentCard): SliceWithCards = copy(columns = columns map { column =>
    column.copy(cards = column.cards map { cardAndIndex =>
      cardAndIndex.copy(item = cardAndIndex.item match {
        case content: ContentCard => f(content)
        case other => other
      })
    })
  })
}

case class ColumnAndCards(column: Column, cards: Seq[FaciaCardAndIndex])
