package model

import com.gu.contentapi.client.model.v1.{CrosswordEntry, Crossword}
import crosswords.CrosswordGridColumnNotation
import org.joda.time.DateTime
import play.api.libs.json._
import implicits.Dates.CapiRichDateTime

case class CrosswordPosition(x: Int, y: Int)

object Entry {
  implicit val positionWrites = Json.writes[CrosswordPosition]
  implicit val jsonWrites = Json.writes[Entry]

  def formatHumanNumber(numbers: String): Option[String] = {

    //Adding space between number and direction
    //as well as after comma
    //ex: "2,24across,16" => "2, 24 across, 16"
    val clues: Seq[Option[String]] = numbers.split(',').map { singleClue =>
      // Acceptable clue is a number followed by an optional direction
      "([0-9]+)([a-z]+)?".r.findFirstMatchIn(singleClue).map { m =>
        val number: String = m.group(1)
        val direction: Option[String] = Option(m.group(2))
        number + direction.map(" " + _).getOrElse("")
      }
    }

    // If any of the clue is malformed we are returning None
    if(clues.forall(_.isDefined)) {
      Some(clues.flatten).map(_.mkString(", "))
    } else {
      None
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
    entry.position.map(position => CrosswordPosition(position.x, position.y)).getOrElse(CrosswordPosition(0,0)),
    entry.separatorLocations.map(_.toMap),
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

case class CrosswordCreator(
  name: String,
  webUrl: String
)

case class CrosswordDimensions(
  cols: Int,
  rows: Int
)

object CrosswordData {

  implicit val dateToTimestampWrites = play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites

  implicit val creatorWrites = Json.writes[CrosswordCreator]

  implicit val dimensionsWrites = Json.writes[CrosswordDimensions]

  implicit val jsonWrites = Json.writes[CrosswordData]

  def fromCrossword(crossword: Crossword): CrosswordData = {
    // For entry groups, all separator locations for entries within the
    // group are incorrectly stored on the first group entry. We normalize
    // the data to store the separator locations on their corresponding entries.

    val shipSolutions = crossword.dateSolutionAvailable.map(_.toJoda.isBeforeNow).getOrElse(crossword.solutionAvailable)

    val entries = crossword.entries.collect {
      case entry if !shipSolutions => Entry.fromCrosswordEntry(entry.copy(solution = None))
      case entry => Entry.fromCrosswordEntry(entry)
    }

    val entryGroups = entries
      .groupBy(_.group)
      // Sort using the group ordering
      .map { case (orderedGroupEntryIds, groupEntries) =>
        (orderedGroupEntryIds, orderedGroupEntryIds.flatMap(id => groupEntries.find(_.id == id)))
      }

    val newEntries = entryGroups.map { case (_, groupEntries) =>
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
    val crosswordType = crossword.`type`.name.toLowerCase

    CrosswordData(
      s"crosswords/$crosswordType/${crossword.number.toString}",
      crossword.number,
      crossword.name,
      creator = for (
        creator <- crossword.creator
      ) yield CrosswordCreator(creator.name, creator.webUrl),
      crossword.date.toJoda,
      sortedNewEntries,
      crossword.solutionAvailable,
      crossword.dateSolutionAvailable.map(_.toJoda),
      CrosswordDimensions(crossword.dimensions.cols, crossword.dimensions.rows),
      crosswordType,
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
  solutionAvailable: Boolean,
  dateSolutionAvailable: Option[DateTime],
  dimensions: CrosswordDimensions,
  crosswordType: String,
  pdf: Option[String],
  instructions: Option[String]
) {
  val acrossEntries = entries.filter(_.direction == "across")
  val downEntries = entries.filter(_.direction == "down")
}
