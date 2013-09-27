package controllers.front

import common._
import model.Trailblock

class Front extends Logging {

  private def allFronts = fronts.values

  lazy val fronts: Map[String, ConfiguredEdition] = Edition.all.flatMap{ edition =>
    edition.configuredFronts.map{
      case (name, blocks) => name ->  new ConfiguredEdition(edition, blocks)
    }.toMap
  }.toMap

  def refresh() {
    log.info("Refreshing Front")
    refreshJobs().foreach(body => body())
  }

  def refreshJobs(): List[() => Unit] =allFronts.toList map { front =>
    () => front.refresh()
  }

  def apply(path: String): Seq[Trailblock] = fronts(path)()
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)