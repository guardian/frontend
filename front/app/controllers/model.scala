package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._

case class TrailWithPackage(trail: Trail, storyPackage: Seq[Trail] = Nil) {

  def layout = {
    val hasCorrectSizeImage = trail.imageOfWidth(460).isDefined
    if (hasCorrectSizeImage && storyPackage.size > 1) "impact"
    else "normal"
  }

}
case class Trailblock(description: TrailblockDescription, trails: Seq[TrailWithPackage])
case class TrailblockDescription(id: String, name: String, numItemsVisible: Int)

class Front(val trailblocks: Seq[Trailblock]) extends MetaData {
  override val canonicalUrl = "http://www.guardian.co.uk"
  override val id = ""
  override val section = ""
  override val apiUrl = "http://content.guardianapis.com"
  override val webTitle = "The Guardian"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> "",
    "content-type" -> "Network Front"
  )

  lazy val collapseEmptyBlocks: Front = new Front(trailblocks filterNot { _.trails.isEmpty })
}

trait FrontTrailblockConfiguration {
  val ukTrailblocks = Seq(
    TrailblockDescription("/", "Top stories", 5),
    TrailblockDescription("/sport", "Sport", 3),
    TrailblockDescription("/football/euro2012", "Euro 2012", 3),
    TrailblockDescription("/commentisfree", "Comment", 3),
    TrailblockDescription("/culture", "Culture", 3),
    TrailblockDescription("/lifeandstyle", "Life & style", 3),
    TrailblockDescription("/business", "Business", 3)
  )

  val usTrailblocks = Seq(
    TrailblockDescription("/", "Top stories", 5),
    TrailblockDescription("/sport", "Sport", 3),
    TrailblockDescription("/sport/nfl", "NFL", 3),
    TrailblockDescription("/commentisfree", "Comment", 3),
    TrailblockDescription("/culture", "Culture", 3),
    TrailblockDescription("/lifeandstyle", "Life & style", 3),
    TrailblockDescription("/business", "Business", 3)
  )
}

object Front extends FrontTrailblockConfiguration with AkkaSupport with Logging {

  private val agents = Map(
    "UK" -> (ukTrailblocks map { TrailblockAgent(_, "UK") }),
    "US" -> (usTrailblocks map { TrailblockAgent(_, "US") })
  )

  case class TrailblockAgent(description: TrailblockDescription, edition: String) {
    private val agent = play_akka.agent(Seq[TrailWithPackage]())

    def trailblock(): Trailblock = Trailblock(description, agent())
    def refreshTrailblock() {
      agent sendOff { s =>
        val trails = loadTrails(description.id, edition)

        //if we cannot load the story package we still want to display the trails
        val storyPackageForFirstTrail = failQuietly(Seq[Trail]()) {
          trails.head match {
            case c: Content => loadStoryPackage(c.id, edition)
            case _ => Nil
          }
        }
        TrailWithPackage(trails.head, storyPackageForFirstTrail) :: trails.tail.map(TrailWithPackage(_, Nil)).toList

      }
    }
  }

  def refreshTrailblocks() { agents.values.flatten map { _.refreshTrailblock() } }

  def apply(edition: String): Front = {
    val trailblocks = agents(if (edition == "US") "US" else "UK") map { _.trailblock() }

    var used = Set[String]()
    var deduped = Seq[Trailblock]()

    for (Trailblock(description, trails) <- trailblocks) {
      val dedupedTrails: Seq[TrailWithPackage] = trails filterNot { _.trail.url in used } take 10

      used ++= dedupedTrails map { _.trail.url }
      deduped :+= Trailblock(description, dedupedTrails)
    }

    new Front(deduped).collapseEmptyBlocks
  }

  private def failQuietly[A](default: A)(block: => A) = try {
    block
  } catch {
    case e => log.error("failed quietly", e); default
  }

  private def loadStoryPackage(id: String, edition: String): Seq[Trail] = {
    log.info("Refreshing trailblock " + id + " for edition " + edition)
    val response: ItemResponse = ContentApi.item
      .showStoryPackage(true)
      .edition(edition)
      .showTags("all")
      .showFields("trail-text,liveBloggingNow")
      .showMedia("all")
      .itemId(id)
      .response

    response.storyPackage map { new Content(_) } filterNot (_.id == id)
  }

  private def loadTrails(id: String, edition: String): Seq[Trail] = {
    log.info("Refreshing trailblock " + id + " for edition " + edition)
    val response: ItemResponse = ContentApi.item
      .edition(edition)
      .showTags("all")
      .showFields("trail-text,liveBloggingNow")
      .showMedia("all")
      .showEditorsPicks(true)
      .showMostViewed(true)
      .itemId(id)
      .pageSize(15)
      .response

    val editorsPicks = response.editorsPicks map { new Content(_) }
    val editorsPicksIds = editorsPicks map (_.id)
    val latest = response.results map { new Content(_) } filterNot (c => editorsPicksIds contains (c.id))

    editorsPicks ++ latest
  }

}