package services

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.parser.JsonParser
import common.Edition
import model.{RelatedContentItem, RelatedContent}
import org.json4s.native.JsonMethods
import play.api.libs.ws.WS
import scala.concurrent.Future
import contentapi.ContentApiClient
import feed.MostReadAgent
import conf.switches.Switches.RelatedContentSwitch
import ContentApiClient.getResponse

trait Related extends ConciergeRepository {
  def related(edition: Edition, path: String, excludeTags: Seq[String] = Nil): Future[RelatedContent] = {

    if (RelatedContentSwitch.isSwitchedOff) {
      Future.successful(RelatedContent(Nil))
    } else {

      // doesn't like "tag" being an empty string - need to explicitly pass a None
      val tags: Option[String] = excludeTags.toList match {
        case Nil => None
        case excluding => Some(excluding.map(t => s"-$t").mkString(","))
      }

      val response = getResponse(ContentApiClient.item(path, edition)
        .tag(tags)
        .showRelated(true)
      )

      val trails = response.map { response =>
        val relatedContentItems = response.relatedContent.getOrElse(Nil) map { item =>
          RelatedContentItem(item)
        }
        RelatedContent(relatedContentItems)
      }

      trails recoverApi404With RelatedContent(Nil)
    }
  }

  def peopleWhoRead(path: String, testVariant: String): Future[RelatedContent] = {

    import play.api.Play.current
    implicit val formats = JsonParser.formats

    val capiRecommenderUrl = s"https://recommend.capi.gutools.co.uk/recommendations/$testVariant/$path"

    WS.url(capiRecommenderUrl).withRequestTimeout(2000).get() map { response =>
      response.status match {
        case 200 =>
          JsonMethods.parse(response.body).extractOpt[RecommendedContentResponse] map { recommendedContentResponse =>
            val relatedContentItems = recommendedContentResponse.items map(rc => RelatedContentItem(rc.content))
            RelatedContent(relatedContentItems)
          } getOrElse RelatedContent(Nil)

        case _ =>
          RelatedContent(Nil)
      }
    }

  }


  def getPopularInTag(edition: Edition, tag: String, excludeTags: Seq[String] = Nil): Future[RelatedContent] = {

    val tags = (tag +: excludeTags.map(t => s"-$t")).mkString(",")

    val response = getResponse(
      ContentApiClient.search(edition)
        .tag(tags)
        .pageSize(50)
    )

    val trails: Future[RelatedContent] = response.map { response =>
      val items = response.results.map { item =>
        RelatedContentItem(item)
      }
      RelatedContent(items.sortBy(content =>
        - MostReadAgent.getViewCount(content.content.metadata.id).getOrElse(0)).take(10))
    }

    trails
  }
}

case class RecommendedContent(score: Double, commonUniques: Int, totalUniques: Int, content: Content)
case class RecommendedContentResponse(items: List[RecommendedContent])
