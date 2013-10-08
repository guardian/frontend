package services

import model._
import conf.ContentApi
import model.Section
import common._
import com.gu.openplatform.contentapi.model.ItemResponse
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import contentapi.QueryDefaults

case class IndexPage(page: MetaData, trails: Seq[Trail])

trait Index extends ConciergeRepository with QueryDefaults {

  private val SinglePart = """([\w\d\.-]+)""".r

  def index(edition: Edition, leftSide: String, rightSide: String) = {

    // if the first tag is just one part then change it to a section tag...
    val firstTag = leftSide match {
      case SinglePart(wordsForUrl) => s"$wordsForUrl/$wordsForUrl"
      case other => other
    }

    // if the second tag is just one part then it is in the same section as the first tag...
    val secondTag = rightSide match {
      case SinglePart(wordsForUrl) => s"${firstTag.split("/")(0)}/$wordsForUrl"
      case other => other
    }

    ContentApi.search(edition)
      .tag(s"$firstTag,$secondTag")
      .pageSize(20)
      .response.map {response =>
        val trails = response.results map { Content(_) }
        trails match {
          case Nil => Right(NotFound)
          case head :: _ =>
            //we can use .head here as the query is guaranteed to return the 2 tags
            val tag1 = head.tags.find(_.id == firstTag).head
            val tag2 = head.tags.find(_.id == secondTag).head
            val pageName = s"${tag1.name} + ${tag2.name}"
            val page = Page(s"$leftSide+$rightSide", tag1.section, pageName, s"GFE:${tag1.section}:$pageName")
            Left(IndexPage(page, trails))
        }
    }.recover(suppressApiNotFound)
  }

  def index(edition: Edition, path: String) = {
    ContentApi.item(path, edition)
      .pageSize(20)
      .showEditorsPicks(true)
      .response.map {response =>
      val page = response.tag.flatMap(t => tag(response)).orElse(response.section.flatMap(t => section(response)))
      ModelOrResult(page, response)
    }.recover(suppressApiNotFound)
  }

  private def section(response: ItemResponse) = {
      val section = response.section map { Section(_) }
      val editorsPicks = response.editorsPicks map { Content(_) }
      val editorsPicksIds = editorsPicks map { _.id }
      val latestContent = response.results map { Content(_) } filterNot { c => editorsPicksIds contains (c.id) }
      val trails = (editorsPicks ++ latestContent).take(math.max(editorsPicks.length, 20))
      section map { IndexPage(_, trails) }
  }

  private def tag(response: ItemResponse) = {
    val tag = response.tag map { new Tag(_) }
    val leadContentCutOff = DateTime.now - leadContentMaxAge
    val editorsPicks: Seq[Content] = response.editorsPicks.map(Content(_))
    val leadContent: Seq[Content] = if (editorsPicks.isEmpty)
      response.leadContent.take(1).map {Content(_) }.filter(_.webPublicationDate > leadContentCutOff)
    else
      Nil

    val latest: Seq[Content] = response.results.map(Content(_)).filterNot(c => leadContent.map(_.id).exists(_ == c.id))
    val allTrails = (leadContent ++ editorsPicks ++ latest).distinctBy(_.id).take(20)
    tag map { IndexPage(_, allTrails) }
  }
}

object Concierge extends Index