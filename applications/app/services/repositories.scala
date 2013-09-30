package services

import model._
import conf.ContentApi
import model.Section
import common._
import com.gu.openplatform.contentapi.model.ItemResponse
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import contentapi.QueryDefaults

case class IndexPage(page: MetaData, trails: Seq[Trail], leadContent: Seq[Trail])

trait Index extends Concierge with QueryDefaults {

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
      section map { IndexPage(_, trails, Nil) }
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
    val allTrails = (editorsPicks ++ latest).distinctBy(_.id).take(20)
    tag map { IndexPage(_, allTrails, leadContent) }
  }
}

object Concierge extends Index