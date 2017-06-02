package contentapi

import com.gu.contentapi.client.model.v1.Section
import common.{AkkaAgent, ExecutionContexts, Logging}

import scala.util.{Failure, Success}

class SectionsLookUp(contentApiClient: ContentApiClient) extends Logging with ExecutionContexts {
  private val sections = AkkaAgent[Option[Map[String, Section]]](None)

  def refresh(): Unit = {
    contentApiClient.getResponse(contentApiClient.sections) onComplete {
      case Success(response) =>
        log.info("Refreshed sections from Content API")
        sections send Some(response.results.flatMap({ section =>
          section.editions.map(_.id -> section)
        }).toMap)
      case Failure(error) =>
        log.error("Could not refresh sections from Content API", error)
    }
  }

  def get(path: String): Option[Section] = {
    sections.get().flatMap(_.get(path))
  }

  def isLoaded(): Boolean = sections.get().isDefined
}
