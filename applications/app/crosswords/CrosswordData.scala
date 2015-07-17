package crosswords

import com.gu.crosswords.api.client.models._
import org.joda.time.LocalDate
import play.api.libs.json._

object CrosswordEntry {
  implicit val directionWrites = new Writes[Direction] {
    override def writes(o: Direction): JsValue = o match {
      case Across => JsString("across")
      case Down => JsString("down")
    }
  }

  implicit val positionWrites = Json.writes[Position]

  implicit val jsonWrites = Json.writes[CrosswordEntry]

  def fromEntry(entry: Entry): CrosswordEntry = CrosswordEntry(
    entry.number,
    entry.clue,
    entry.direction,
    entry.length,
    entry.position,
    entry.solution
  )
}

case class CrosswordEntry(
  number: Int,
  clue: String,
  direction: Direction,
  length: Int,
  position: Position,
  solution: Option[String]
)

object CrosswordData {
  implicit val creatorWrites = Json.writes[Creator]

  implicit val dimensionsWrites = Json.writes[Dimensions]

  implicit val typeWrites = new Writes[Type] {
    override def writes(o: Type): JsValue = JsString(Type.byType(o))
  }

  implicit val jsonWrites = Json.writes[CrosswordData]

  def fromCrossword(crossword: Crossword) = CrosswordData(
    s"${Type.byType(crossword.`type`)}/${crossword.number.toString}",
    crossword.number,
    crossword.name,
    crossword.creator,
    crossword.date,
    crossword.entries.map(CrosswordEntry.fromEntry),
    crossword.dimensions,
    crossword.`type`
  )
}

case class CrosswordData(
  id: String,
  number: Int,
  name: String,
  creator: Option[Creator],
  date: LocalDate,
  entries: Seq[CrosswordEntry],
  dimensions: Dimensions,
  crosswordType: Type
)
