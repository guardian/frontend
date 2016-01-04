package model

import com.gu.contentapi.client.model.v1.{CrosswordEntry, CrosswordPosition, CrosswordCreator, CrosswordDimensions, Crossword}
import crosswords.CrosswordGridColumnNotation
import org.joda.time.{DateTimeZone, DateTime}
import org.joda.time.format.ISODateTimeFormat
import play.api.libs.json._

object Entry {
  implicit val positionWrites = Json.writes[CrosswordPosition]
  implicit val jsonWrites = Json.writes[Entry]

  val NumberPattern = "[^a-z]+".r
  val DirectionPattern = "[a-z]+".r

  def formatHumanNumber(numbers: String): Option[String] = {
    NumberPattern.findFirstIn(numbers).map { number =>
      val spaced = number.split(",").mkString(", ")

      DirectionPattern.findFirstIn(numbers) match {
        case Some(direction) => spaced.concat(s" $direction")
        case None => spaced
      }
    }
  }

  def fromCrosswordEntry(entry: CrosswordEntry): Entry = Entry(
    entry.id,
    entry.number.getOrElse(0),
    entry.humanNumber.flatMap(formatHumanNumber).getOrElse("0"),
    entry.clue.getOrElse(""),
    entry.direction.getOrElse(""),
    entry.length.getOrElse(0),
    entry.group.getOrElse(Seq()),
    entry.position.getOrElse(CrosswordPosition(0,0)),
    entry.separatorLocations.map(separatorLocations => (
      separatorLocations.map(separatorLocation => (
        for (
          separator <- separatorLocation.separator;
          locations <- separatorLocation.locations
        ) yield (separator, locations)
      )).flatten.toMap
    )),
    entry.solution
  )
}

case class Entry(
  id: String,
  number: Int,
  humanNumber: String,
  clue: String,
  direction: String,
  length: Int,
  group: Seq[String],
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

  def fromCrossword(crossword: Crossword) = {
    // For entry groups, all separator locations for entries within the
    // group are incorrectly stored on the first group entry. We normalize
    // the data to store the separator locations on their corresponding entries.

    val entries = crossword.entries.map(Entry.fromCrosswordEntry)

    val entryGroups = entries
      .groupBy(_.group)
      // Sort using the group ordering
      .map { case (orderedGroupEntryIds, groupEntries) =>
        (orderedGroupEntryIds, orderedGroupEntryIds.flatMap(id => groupEntries.find(_.id == id)))
      }

    val newEntries = entryGroups.map { case (k, groupEntries) =>
      val maybeSeparatorLocations: Option[Map[String, Seq[Int]]] =
        groupEntries
          .find(_.separatorLocations.exists(_.nonEmpty))
          .flatMap(_.separatorLocations)

      val bounds: Map[(Int, Int), Entry] =
        groupEntries.foldLeft((0, Map.empty[(Int, Int), Entry])) { case ((upperBound, m), entry) =>
          val newLowerBound = upperBound
          val newUpperBound = upperBound + entry.length
          (newUpperBound, m + ((newLowerBound, newUpperBound) -> entry))
        }._2

      val newGroupEntries: Seq[Entry] = bounds.map { case ((lowerBound, upperBound), entry) =>
        maybeSeparatorLocations.map { separatorLocations =>
          val newSeparatorLocations: Map[String, Seq[Int]] = separatorLocations.map { case (separator, locations) =>
            val newLocations =
              locations
                .filter(location => location > lowerBound && location <= upperBound)
                .map(location => location - lowerBound)
            (separator, newLocations)
          }
          entry.copy(separatorLocations = Some(newSeparatorLocations))
        }.getOrElse(entry)
      }.toList

      newGroupEntries
    }.toList.flatten

    // Revert back to the original order
    val sortedNewEntries = entries.flatMap(entry => newEntries.find(_.id == entry.id))

    CrosswordData(
      s"${crossword.`type`}/${crossword.number.toString}",
      crossword.number,
      crossword.name,
      crossword.creator,
      dateFormatUTC.parseDateTime(crossword.date.dateTime.toString),
      sortedNewEntries,
      crossword.dimensions,
      crossword.`type`.name,
      crossword.pdf,
      crossword.instructions
    )
  }
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
) {
  val acrossEntries = entries.filter(_.direction == "across")
  val downEntries = entries.filter(_.direction == "down")
}
