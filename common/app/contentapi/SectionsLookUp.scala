package contentapi

import com.gu.contentapi.client.model.Section
import common.{AkkaAgent, ExecutionContexts, Logging}
import conf.LiveContentApi

import scala.util.{Failure, Success}

object SectionsLookUp extends Logging with ExecutionContexts {
  private val sections = AkkaAgent[Option[Map[String, Section]]](None)

  def refresh() = {
    LiveContentApi.sections.response onComplete {
      case Success(response) =>
        log.info("Refreshed sections from Content API")
        sections send Some(response.results.flatMap({ section =>
          section.editions.map(_.id -> section)
        }).toMap)
      case Failure(error) =>
        log.error("Could not refresh sections from Content API", error)
    }
  }

  def get(path: String) = {
    sections.get().flatMap(_.get(path))
  }

  def isLoaded() = sections.get().isDefined
}
