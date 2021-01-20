package crosswords

import model._
import org.joda.time.DateTime

import scala.xml.Elem

sealed trait CrosswordPage extends Page

final case class CrosswordPageWithSvg(
    content: CrosswordContent,
    svg: Elem,
) extends CrosswordPageWithContent(content)
    with CrosswordPage

final case class AccessibleCrosswordPage(
    content: CrosswordContent,
    blankSquares: AccessibleCrosswordRows,
) extends CrosswordPageWithContent(content)
    with CrosswordPage

final class CrosswordSearchPageNoResult extends CrosswordSearchPage with CrosswordPage
final class CrosswordSearchPageWithResults extends CrosswordSearchPage with CrosswordPage

class CrosswordPageWithContent(content: CrosswordContent) extends ContentPage {

  override lazy val item = content
  val crossword = content.crossword

  import CrosswordSvg.{BorderSize, CellSize}

  case class SvgDimensions(width: Int, height: Int) {
    def styleString: String = s"width: $width; height: $height"
  }

  def fallbackDimensions: SvgDimensions =
    SvgDimensions(
      crossword.dimensions.cols * (CellSize + BorderSize) + BorderSize,
      crossword.dimensions.rows * (CellSize + BorderSize) + BorderSize,
    )

  def hasGroupedClues: Boolean = crossword.entries.exists(_.group.length > 1)
}

class CrosswordSearchPage extends StandalonePage {

  val metadata = MetaData.make(
    id = "crosswords/search",
    section = Some(SectionId.fromId("crosswords")),
    webTitle = "Crosswords search",
  )

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
    "azed",
    "weekend",
  )

  val setters: Seq[String] = Seq(
    "Anto",
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
    "Carpathian",
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
    "Matilda",
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
    "Vlad",
    "Vulcan",
  )
}
