package layout

import model.pressed.CollectionConfig
import slices.{MobileShowMore, RestrictTo}
import scala.annotation.tailrec

case class SliceWithCards(cssClassName: String, columns: Seq[ColumnAndCards]) {
  def numberOfItems: Int =
    (columns map { columnAndCards: ColumnAndCards =>
      columnAndCards.column match {
        case Rows(_, cols, _, _) => cols
        case _                   => 1
      }
    }).sum

  def numberOfCols: Int =
    (columns map { columnAndCards: ColumnAndCards =>
      columnAndCards.column.colSpan
    }).sum

  def transformCards(f: ContentCard => ContentCard): SliceWithCards =
    copy(columns = columns map { column =>
      column.copy(cards = column.cards map { cardAndIndex =>
        cardAndIndex.copy(item = cardAndIndex.item match {
          case content: ContentCard => f(content)
          case other                => other
        })
      })
    })
}

object SliceWithCards {
  def fromBlobs(layout: SliceLayout, blobs: Seq[HtmlAndClasses]): SliceWithCards = {

    @tailrec
    def columnsWithCards(
        columns: List[Column],
        items: Seq[HtmlAndClasses],
        accumulation: Vector[ColumnAndCards] = Vector.empty,
    ): Seq[ColumnAndCards] = {

      columns match {
        case Nil                        => accumulation
        case column :: remainingColumns =>
          val (itemsForColumn, itemsNotConsumed) = items splitAt column.numItems

          val columnAndCards = ColumnAndCards(
            column,
            itemsForColumn.zipWithIndex map { case (HtmlAndClasses(index, html, classes), positionInColumn) =>
              FaciaCardAndIndex(
                index,
                HtmlBlob(html, classes, Column.cardStyle(column, positionInColumn).getOrElse(ItemClasses.showMore)),
                None,
              )
            },
          )
          columnsWithCards(remainingColumns, itemsNotConsumed, accumulation :+ columnAndCards)
      }

    }

    SliceWithCards(
      layout.cssClassName,
      columnsWithCards(layout.columns.toList, blobs),
    )
  }

  /** The slice with cards assigned to columns, and the remaining cards that were not consumed, and the new context for
    * creating further cards.
    */
  def fromItems(
      items: Seq[IndexedTrail],
      layout: SliceLayout,
      context: ContainerLayoutContext,
      config: CollectionConfig,
      mobileShowMore: MobileShowMore,
      showSeriesAndBlogKickers: Boolean,
  ): (SliceWithCards, Seq[IndexedTrail], ContainerLayoutContext) = {
    val (columns, unconsumed, endContext) = layout.columns.foldLeft((Seq.empty[ColumnAndCards], items, context)) {
      case ((acc, itemsRemaining, currentContext), column) =>
        val (itemsForColumn, itemsNotConsumed) = itemsRemaining splitAt column.numItems

        val (finalContext, cards) =
          itemsForColumn.zipWithIndex.foldLeft((currentContext, Seq.empty[FaciaCardAndIndex])) {
            case ((contextSoFar, accumulator), (IndexedTrail(trail, index), positionInColumn)) =>
              val (card, contextForNext) = contextSoFar.transform(
                FaciaCardAndIndex(
                  index,
                  FaciaCard.fromTrail(
                    trail,
                    config,
                    Column.cardStyle(column, positionInColumn).getOrElse(ItemClasses.showMore),
                    showSeriesAndBlogKickers,
                  ),
                  mobileShowMore match {
                    case RestrictTo(nToShowOnMobile) if index >= nToShowOnMobile => Some(Mobile)
                    case _                                                       => None
                  },
                ),
              )

              (contextForNext, accumulator :+ card)
          }

        (acc :+ ColumnAndCards(column, cards), itemsNotConsumed, finalContext)
    }

    (SliceWithCards(layout.cssClassName, columns), unconsumed, endContext)
  }
}
