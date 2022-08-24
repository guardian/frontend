package agents

import com.gu.contentapi.client.utils.format.Theme
import common.{Edition, GuLogging}
import services.fronts.FrontJsonFapiLive

class CuratedContentAgent(frontJsonFapiLive: FrontJsonFapiLive) extends GuLogging {
  val containerIds: Map[Theme, Map[Edition, String]] = Map()
  def getTrails(theme: Theme, edition: Edition): Seq[String] = Seq()
}
