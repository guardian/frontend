package crosswords

import org.joda.time.DateTime
import com.gu.contentapi.client.{model => contentapi}
import model.{MetaData, Content, GuardianContentTypes}
import play.api.libs.json.{JsString, JsValue}

case class SvgDimensions(width: Int, height: Int) {
  def styleString = s"width: $width; height: $height"
}

class CrosswordPage(val crossword: CrosswordData, content: contentapi.Content) extends Content(content) {

  override lazy val id: String = crossword.id

  override lazy val section: String = "crosswords"

  override lazy val analyticsName: String = id

  override lazy val webTitle: String = crossword.name

  override lazy val contentType = GuardianContentTypes.Crossword

  override lazy val metaData: Map[String, JsValue] =
    super.metaData ++ Map("contentType" -> JsString(contentType))

  import CrosswordSvg.{BorderSize, CellSize}

  def fallbackDimensions = SvgDimensions(
    crossword.dimensions.cols * (CellSize + BorderSize) + BorderSize,
    crossword.dimensions.rows * (CellSize + BorderSize) + BorderSize
  )

  def hasGroupedClues = crossword.entries.exists(_.group.length > 1)
}

trait CrosswordSearchPage extends MetaData {
  override def id: String = "crosswords/search"

  override def section: String = "crosswords"

  override def analyticsName: String = "Crosswords search"

  override def webTitle: String = analyticsName

  val year = new DateTime().getYear
  val searchYears = 1999 to year

  val crosswordTypes: Seq[String] = Seq(
    "quick",
    "cryptic",
    "prize",
    "quiptic",
    "genius",
    "speedy",
    "everyman"
  )

  val setters: Seq[String] = Seq(
    "Arachne",
    "Araucaria",
    "Audreus",
    "Auster",
    "Beale",
    "Biggles",
    "Boatman",
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
    "Puck",
    "Qaos",
    "Quantum",
    "Rover",
    "Rufus",
    "Shed",
    "Taupi",
    "Tramp",
    "Troll"
  )
}

object CrosswordSearchPage extends CrosswordSearchPage
