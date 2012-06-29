package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import akka.util.Timeout

trait TrailblockAgent extends AkkaSupport with Logging {

  val waitTime = 3000

  private val trailblockAgent = play_akka.agent[Option[Trailblock]](None)

  def trailblockDescription: Option[TrailblockDescription]

  def trailblock: Option[Trailblock] = trailblockAgent()

  def edition: String

  def shutdown() { trailblockAgent.close() }

  def refresh() {
    trailblockAgent.sendOff { s =>
      trailblockDescription.map { description =>
        val trails = loadTrails(description.id, edition)

        //if we cannot load the story package we still want to display the trails
        val storyPackageForFirstTrail = failQuietly(Seq[Trail]()) {
          trails.head match {
            case c: Content => loadStoryPackage(c.id, edition)
            case _ => Nil
          }
        }
        Trailblock(
          description,
          TrailWithPackage(trails.head, storyPackageForFirstTrail) :: trails.tail.map(TrailWithPackage(_, Nil)).toList
        )
      }
    }
  }

  def refreshAndWait() {
    refresh()
    quietly(trailblockAgent.await(Timeout(waitTime)))
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

    editorsPicks ++ latest
  }
}

case class ManualTrailblockAgent(description: TrailblockDescription, edition: String) extends TrailblockAgent {
  override def trailblockDescription = Some(description)
}

case class FolderTrailblockAgent(folderId: String, edition: String) extends TrailblockAgent {

  private val descriptionAgent = play_akka.agent[Option[TrailblockDescription]](None)

  override def trailblockDescription = descriptionAgent()

  override def shutdown() {
    descriptionAgent.close()
    super.shutdown()
  }

  override def refresh() {
    refreshInternal()
    super.refresh()
  }

  override def refreshAndWait() {
    refreshInternal()
    quietly(descriptionAgent.await(Timeout(waitTime)))
    super.refresh()
  }

  private def refreshInternal() {
    descriptionAgent.sendOff { s =>
      val response = ContentApi.tags.folder(folderId).response
      response.results.headOption.map(Tag(_)).map(toTrailblockDescription)
    }
  }

  private def toTrailblockDescription(tag: Tag) = {
    val id = if (tag.isSectionTag) tag.section else tag.id
    TrailblockDescription(id, tag.name, 3)
  }
}

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

object Front extends Logging {

  private val ukAgents = Seq(
    ManualTrailblockAgent(TrailblockDescription("/", "Top stories", 5), "UK"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-1", "UK"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-2", "UK"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-3", "UK"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-4", "UK"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-5", "UK"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks/zone-6", "UK")
  )

  private val usAgents = Seq(
    ManualTrailblockAgent(TrailblockDescription("/", "Top stories", 5), "US"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-1", "US"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-2", "US"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-3", "US"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-4", "US"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-5", "US"),
    FolderTrailblockAgent("folder/guardianmobileeditorsindex/mobile-front-trailblocks-us/us-zone-6", "US")
  )

  private val allAgents = ukAgents ++ usAgents

  def shutdown() { allAgents.foreach(_.shutdown()) }

  def refresh() { allAgents.foreach(_.refresh()) }

  def refreshAndWait() { allAgents.foreach(_.refreshAndWait()) }

  def apply(edition: String): Front = {
    val trailblocks = (if (edition == "US") usAgents else ukAgents) flatMap { _.trailblock }

    var used = Set[String]()
    var deduped = Seq[Trailblock]()

    for (Trailblock(description, trails) <- trailblocks) {
      val dedupedTrails: Seq[TrailWithPackage] = trails filterNot { _.trail.url in used } take 10

      used ++= dedupedTrails map { _.trail.url }
      deduped :+= Trailblock(description, dedupedTrails)
    }

    new Front(deduped).collapseEmptyBlocks
  }
}