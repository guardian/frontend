package crosswords

import model._
import org.joda.time.DateTime

case class SvgDimensions(width: Int, height: Int) {
  def styleString = s"width: $width; height: $height"
}

case class CrosswordPage(content: CrosswordContent) extends ContentPage {

  override lazy val item = content
  val crossword = content.crossword

  import CrosswordSvg.{BorderSize, CellSize}

  def fallbackDimensions = SvgDimensions(
    crossword.dimensions.cols * (CellSize + BorderSize) + BorderSize,
    crossword.dimensions.rows * (CellSize + BorderSize) + BorderSize
  )

  def hasGroupedClues = crossword.entries.exists(_.group.length > 1)
}

object CrosswordSearchPage {
  def make(): CrosswordSearchPage = {

    val metadata = MetaData.make (
      id = "crosswords/search",
      section = Some(SectionSummary.fromId("crosswords")),
      webTitle = "Crosswords search"
    )

    CrosswordSearchPage(metadata)
  }
}

final case class CrosswordSearchPage(override val metadata: MetaData) extends StandalonePage {

  val year = new DateTime().getYear
  val searchYears = 1999 to year

  val crosswordTypes: Seq[String] = Seq(
    "quick",
    "cryptic",
    "prize",
    "quiptic",
    "genius",
    "speedy",
    "everyman",
    "azed"
  )

  val setters: Seq[String] = Seq(
    "Arachne",
    "Araucaria",
    "Audreus",
    "Auster",
    "Beale",
    "Biggles",
    "Boatman",
    "Bogus",
    "Bonxie",
    "Brendan",
    "Brummie",
    "Bunthorne",
    "Chaucer",
    "Chifonie",
    "Crispa",
    "Crucible",
    "Don",
    "Egoist",
    "Enigmatist",
    "Fawley",
    "Fidelio",
    "Fiore",
    "Gemini",
    "Gordius",
    "Guy",
    "Hazard",
    "Hectence",
    "Hendra",
    "Imogen",
    "Janus",
    "Kookaburra",
    "Logodaedalus",
    "Maskarade",
    "Mercury",
    "Moley",
    "Nutmeg",
    "Omnibus",
    "Orlando",
    "Pan",
    "Pasquale",
    "Paul",
    "Philistine",
    "Picaroon",
    "Pinkie",
    "Plodge",
    "Provis",
    "Puck",
    "Qaos",
    "Quantum",
    "Rover",
    "Rufus",
    "Screw",
    "Shed",
    "Taupi",
    "Tramp",
    "Troll",
    "Vlad"
  )
}
