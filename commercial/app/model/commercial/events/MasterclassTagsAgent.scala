package model.commercial.events

import common.{AkkaAgent, Logging, ExecutionContexts}
import model.commercial.Lookup

import scala.concurrent.Future

object MasterclassTagsAgent extends ExecutionContexts with Logging {

  private lazy val tagKeywordIds = AkkaAgent(Map.empty[String, Seq[String]])

  private val defaultTags = Seq(
    "creative writing",
    "journalism",
    "photography",
    "travel"
  )

  def refresh(): Future[Seq[Future[Map[String, Seq[String]]]]] = {
    val tags = {
      val current = MasterclassAgent.availableMasterclasses
      if (current.isEmpty) {
        defaultTags
      } else {
        // use event title instead of tags because it's more informative
        current.map(_.name).distinct
      }
    }
    Future.sequence {
      tags map { tag =>
        Lookup.keyword(tag) map { keywords =>
          tagKeywordIds.alter(_.updated(tag, keywords.map(_.id)))
        }
      }
    }
  }

  def forTag(name: String) = tagKeywordIds.get.getOrElse(name, Nil)
}
