import com.gu.contentapi.client.model.v1.{CrosswordPosition, CrosswordEntry}

package object crosswords {

  implicit class RichEntry(crosswordEntry: CrosswordEntry) {
    def allPositions(): Iterable[CrosswordPosition] = {
      val positions = for {
        length <- crosswordEntry.length
        direction <- crosswordEntry.direction
        position <- crosswordEntry.position
      } yield {
        for {i <- 0 until length} yield {
          direction match {
            case "across" => position.copy(x = position.x + i)
            case "down" => position.copy(y = position.y + i)
          }
        }
      }
      positions.getOrElse(Nil)
    }
  }
}
