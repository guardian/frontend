package common.dfp

import common.{AkkaAgent, ExecutionContexts, Logging}
import conf.LiveContentApi
import conf.LiveContentApi.getResponse

import scala.concurrent.Future

object CapiLookupAgent extends ExecutionContexts with Logging {

  private val agent = AkkaAgent[Map[(TagType, String), Seq[String]]](Map.empty)

  def refresh(paidForTags: Seq[PaidForTag]): Future[Map[(TagType, String), Seq[String]]] = {
    lookup(paidForTags) flatMap { freshData =>
      agent alter { oldData =>
        if (freshData.nonEmpty) freshData
        else oldData
      }
    }
  }

  private def lookup(paidForTags: Seq[PaidForTag]): Future[Map[(TagType, String), Seq[String]]] = {

    def lookup(tagType: TagType, tagName: String): Future[((TagType, String), Seq[String])] = {
      val query = LiveContentApi.tags.q(tagName).tagType(tagType.name).pageSize(50)
      val lookupResult = getResponse(query) map { response =>
        response.results
      } recover {
        case e: Exception =>
          log.warn(s"Failed to look up $tagType '$tagName': ${e.getMessage}")
          Nil
      }
      lookupResult map { tags =>
        val matchingTagIds = tags.map(_.id).filter(_.endsWith(s"/$tagName")).sorted
        (tagType, tagName) -> matchingTagIds
      }
    }

    val lookupResults = paidForTags.groupBy(_.tagType).flatMap { case (tagType, tags) =>
      tags map { tag =>
        lookup(tagType, tag.targetedName)
      }
    }

    Future.sequence(lookupResults) map (_.toMap)
  }

  def getTagIds(tagType: TagType, targetedName: String): Seq[String] =
    agent.get().getOrElse((tagType, targetedName), Nil)
}
