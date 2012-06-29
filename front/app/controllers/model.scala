package controllers

import com.gu.openplatform.contentapi.model.{ TagsResponse, ItemResponse }
import common._
import conf._
import model._
import akka.util.Timeout

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

case class FolderTrailblock(folderId: Option[String], default: TrailblockDescription)

object FrontTrailblockConfiguration extends AkkaSupport with Logging {

  val topStories = TrailblockDescription("/", "Top stories", 5)

  case class FolderBasedTrailblockAgent(folderId: String) {
    private val agent = play_akka.agent(None: Option[TrailblockDescription])
    def trailBlockDescription = agent()
    def refresh = {
      agent.sendOff { s =>
        val response = ContentApi.tags.folder(folderId).response
        val description = response.results.headOption.map(Tag(_)).map(toTrailblockDescription)
        log.info("Resolved trailblock " + description)
      }
    }
    def await(millisToWait: Long) = agent.await(Timeout(millisToWait))

    private def toTrailblockDescription(tag: Tag) = {
      val id = if (tag.isSectionTag) tag.section else tag.id
      TrailblockDescription(id, tag.name, 3)
    }

    def close() = agent.close()

  }

  private val ukAgents = List(
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-1"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-2"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-3"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-4"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-5"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-6")
  )

  private val usAgents = List(
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-1"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-2"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-3"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-4"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-5"),
    FolderBasedTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-6")
  )

  private lazy val allAgents = ukAgents ++ usAgents

  def ukTrailblocks = topStories :: ukAgents.flatMap(_.trailBlockDescription)
  def usTrailblocks = topStories :: usAgents.flatMap(_.trailBlockDescription)

  def refresh() = {
    log.info("Refreshing trailblock configurations")
    allAgents.foreach(_.refresh)
  }

  def refreshAndWait() = {
    refresh()
    allAgents.foreach { a => quietly(a.await(1000)) }
  }

  def shutdown() = allAgents.foreach(_.close())
}

object Front extends AkkaSupport with Logging {

  import FrontTrailblockConfiguration._

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
    def await(timeout: Long) = quietly(agent.await(1000))
    def close() = agent.close()
  }

  def shutdown() = agents foreach {
    case (_, agents) => agents.foreach(_.close())
  }

  def refreshTrailblocks() { agents.values.flatten map { _.refreshTrailblock() } }

  def refreshTrailblocksAndWait() {
    refreshTrailblocks()
    agents.values.flatten foreach (a => quietly(a.await(1000)))
  }

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
    val response: ItemResponse = ContentApi.item(id, edition)
      .showStoryPackage(true)
      .response

    response.storyPackage map { new Content(_) } filterNot (_.id == id)
  }

  private def loadTrails(id: String, edition: String): Seq[Trail] = {
    log.info("Refreshing trailblock " + id + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(id, edition)
      .showEditorsPicks(true)
      .showMostViewed(true)
      .pageSize(15)
      .response

    val editorsPicks = response.editorsPicks map { new Content(_) }
    val editorsPicksIds = editorsPicks map (_.id)
    val latest = response.results map { new Content(_) } filterNot (c => editorsPicksIds contains (c.id))

    val allResults = editorsPicks ++ latest
    log.info("Trailblock " + id + " for edition " + edition + " returned " + allResults.size + " results.")
    allResults
  }
}