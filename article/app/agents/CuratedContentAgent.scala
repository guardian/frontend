package agents

import com.gu.contentapi.client.utils.format.Theme
import common.{Edition, GuLogging}
import model.dotcomrendering.Trail

class CuratedContentAgent() extends GuLogging {
  val containerIds: Map[Theme, Map[Edition, String]] = Map()
  def getTrails(theme: Theme, edition: Edition): Seq[Trail] = Seq()
}
