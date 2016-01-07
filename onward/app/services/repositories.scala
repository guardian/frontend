package services

import com.gu.contentapi.client.model.v1.Content
import common.Edition
import model.{RelatedContentItem, RelatedContent}
import scala.concurrent.Future
import conf.LiveContentApi
import feed.MostReadAgent
import conf.switches.Switches.RelatedContentSwitch
import LiveContentApi.getResponse

trait Related extends ConciergeRepository {
  def related(edition: Edition, path: String, excludeTags: Seq[String] = Nil): Future[RelatedContent] = {

    if (RelatedContentSwitch.isSwitchedOff) {
      Future.successful(RelatedContent(Nil))
    } else {

      // doesn't like "tag" being an empty string - need to explicitly pass a None
      val tags: Option[String] = excludeTags match {
        case Nil => None
        case excluding => Some(excluding.map(t => s"-$t").mkString(","))
      }

      val response = getResponse(LiveContentApi.item(path, edition)
        .tag(tags)
        .showRelated(true)
      )

      val trails = response.map { response =>
        val relatedContentItems = response.relatedContent map { item =>
          RelatedContentItem(item)
        }
        RelatedContent(relatedContentItems)
      }

      trails recoverApi404With RelatedContent(Nil)
    }
  }

  def getPopularInTag(edition: Edition, tag: String, excludeTags: Seq[String] = Nil): Future[RelatedContent] = {

    val tags = (tag +: excludeTags.map(t => s"-$t")).mkString(",")

    val response = getResponse(
      LiveContentApi.search(edition)
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

  def tagsOnly(keywordIds: Seq[String]) = {
    keywordIds.filter { tag =>
      val split = tag.split("/").toList
      split.headOption.flatMap(first => split.drop(1).headOption.map(_ != first)).getOrElse(false)
    }
  }

  def getRelatedByTags(edition: Edition, path: String, keywordIds: Seq[String]): Future[RelatedContent] = {

    case class MatchingTags(matching: Seq[String], item: Content)

    val TAGS_TO_USE = 3
    val NUMBER_FROM_EACH_TAG = 2
    val MAX_RELATED_CONTENT = 8

    val tagIds = tagsOnly(keywordIds).take(TAGS_TO_USE)
    val tags = tagIds.mkString("|")

    val response = getResponse(
      LiveContentApi.search(edition)
        .tag(tags)
        .pageSize(50)// if we haven't found all the tags twice in the last 50, just use backfill for now
    )

    val trails: Future[RelatedContent] = response.map { response =>
      val potentialItems = response.results.filterNot { item =>
        item.id == path
      }.map { item =>
        TagsArticle(item.tags.map(_.id), item)
      }
      val (in, out) = getFirstTwoEachTag(potentialItems, tagIds, List.fill(TAGS_TO_USE)(NUMBER_FROM_EACH_TAG))
      val items = (in ++ out).take(MAX_RELATED_CONTENT).map { item =>
        RelatedContentItem(item)
      }
      RelatedContent(items)
    }

    trails
  }

  def getFirstTwoEachTag[A](items: Seq[TagsArticle[A]], tagIds: Seq[String], distribution: List[Int]) =
    items.foldLeft(((List[A](), List[A]()), distribution)) { case (((topInTags, backfill), numStillNeededForTags), item) =>
      // this is the first index through the requested keywords that a tag in the article appears
      val tagIndexPresent = tagIds.map(item.tags.contains).indexOf(true)
      val needThisArticle = numStillNeededForTags(tagIndexPresent) > 0
      if (needThisArticle) {
        ((item.article :: topInTags, backfill), numStillNeededForTags.updated(tagIndexPresent, numStillNeededForTags(tagIndexPresent) - 1))
      } else {
        ((topInTags, item.article :: backfill), numStillNeededForTags)
      }
    }._1 match {
        // need to reverse because foldleft and prepend always comes backways
      case (in, out) => (in.reverse, out.reverse)
    }

  case class TagsArticle[A](tags: Seq[String], article: A)

}
