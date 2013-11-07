package feed

import conf.ContentApi
import common._
import model.Content
import org.joda.time.DateTime

object LatestContentAgent extends Logging with ExecutionContexts {

  // maps editions to latest content
  private val agent = AkkaAgent[Map[String, Content]](Map.empty)

  def latestContent(edition: Edition): Option[Content] = agent().get(edition.id)

  def update() {
    log.info("Updating latest content.")
    update(Edition.defaultEdition)
  }

  private def update(edition: Edition) {
    val newFetchedContent = ContentApi.search(edition).response.map(_.results.headOption.map(Content(_)))

    newFetchedContent.map( _.foreach {content =>

      val currentTimestamp: DateTime = agent.get().get(edition.id).map(_.webPublicationDate).getOrElse(new DateTime(0))

      if (content.webPublicationDate.isAfter(currentTimestamp)) {
        agent.send( currentMap => {
          currentMap.updated(edition.id, content)
        })

        services.RecentlyPublished.publish(content)

        log.info(s"Publishing ${content.url}, it was published at: ${content.webPublicationDate.toString("yyyy-MM-dd'T'HH:mm:ssZ")}.")
      }
    })
  }
}