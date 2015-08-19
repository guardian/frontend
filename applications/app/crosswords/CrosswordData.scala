package crosswords

import com.gu.contentapi.client.model.{CrosswordEntry, CrosswordPosition, CrosswordCreator, CrosswordDimensions, Crossword}
import org.joda.time.{DateTimeZone, DateTime}
import org.joda.time.format.ISODateTimeFormat
import play.api.libs.json._

object Entry {

  implicit val positionWrites = Json.writes[CrosswordPosition]

  implicit val jsonWrites = Json.writes[Entry]

  def fromCrosswordEntry(entry: CrosswordEntry): Entry = Entry(
    entry.id,
    entry.number.getOrElse(0),
    entry.clue.getOrElse(""),
    entry.direction.getOrElse(""),
    entry.length.getOrElse(0),
    entry.group,
    entry.position.getOrElse(CrosswordPosition(0,0)),
    entry.separatorLocations,
    entry.solution
  )
}

case class Entry(
  id: String,
  number: Int,
  clue: String,
  direction: String,
  length: Int,
  group: Option[Seq[String]],
  position: CrosswordPosition,
  separatorLocations: Option[Map[String, Seq[Int]]],
  solution: Option[String]
) extends CrosswordGridColumnNotation {
  lazy val startPosition = s"${(position.y + 1).toString}${columnsByLetters(position.x)}"
}

object CrosswordData {

  private val dateFormatUTC = ISODateTimeFormat.dateParser().withZone(DateTimeZone.UTC)

  implicit val creatorWrites = Json.writes[CrosswordCreator]

  implicit val dimensionsWrites = Json.writes[CrosswordDimensions]

  implicit val jsonWrites = Json.writes[CrosswordData]

  def fromCrossword(crossword: Crossword) = CrosswordData(
    s"${crossword.`type`}/${crossword.number.toString}",
    crossword.number,
    crossword.name,
    crossword.creator,
    dateFormatUTC.parseDateTime(crossword.date),
    crossword.entries.map(Entry.fromCrosswordEntry),
    crossword.dimensions,
    crossword.`type`,
    crossword.pdf,
    crossword.instructions
  )
}

case class CrosswordData(
  id: String,
  number: Int,
  name: String,
  creator: Option[CrosswordCreator],
  date: DateTime,
  entries: Seq[Entry],
  dimensions: CrosswordDimensions,
  crosswordType: String,
  pdf: Option[String],
  instructions: Option[String]
)
