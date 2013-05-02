package controllers.front

import model.{Content, Trail, TrailblockDescription}
import scala.concurrent.Future
import conf.ContentApi
import play.api.libs.concurrent.Execution.Implicits._

class AustraliaTrailblockAgent(description: TrailblockDescription, edition: String)
                                extends TrailblockAgent(description, edition) {

  override def refresh() = loadTrails(description.id, description.editorsPicks, description._section, description.orderBy) map refreshTrails

  def loadTrails(id: String): Future[Seq[Trail]] = loadTrails(id, editorsPicks=None, section=None, orderBy=None)

  def loadTrails(id: String, editorsPicks: Option[Boolean], section: Option[String] = None, orderBy: Option[String]): Future[Seq[Trail]] = ContentApi.item(id, edition)
    .showEditorsPicks(editorsPicks)
    .pageSize(20)
    .section(section)
    .orderBy(orderBy)
    .response
    .map { response =>
    val responseEditorsPicks = response.editorsPicks map {
      new Content(_)
    }
    val editorsPicksIds = responseEditorsPicks map (_.id)

    val latest = response.results map {
      new Content(_)
    } filterNot (c => editorsPicks.isDefined && (editorsPicksIds contains (c.id)))

    responseEditorsPicks ++ latest
  }

}

object AustraliaTrailblockAgent {
  def apply(description: TrailblockDescription, edition: String) =
    new AustraliaTrailblockAgent(description, edition)
}
