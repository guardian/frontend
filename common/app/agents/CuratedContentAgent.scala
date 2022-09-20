package agents

import com.gu.contentapi.client.utils.format.Theme
import common.{Box, Edition, GuLogging}
import model.dotcomrendering.Trail
import model.pressed.PressedContent
import services.fronts.FrontJsonFapiLive

class CuratedContentAgent(frontJsonFapiLive: FrontJsonFapiLive) extends GuLogging {
  private lazy val curatedContentAgent = Box[Map[String, Seq[PressedContent]]](Map.empty)
  private lazy val curatedContentAdFreeAgent = Box[Map[String, Seq[PressedContent]]](Map.empty)

  val containerIds: Map[Theme, Map[Edition, String]] = Map()
  def getTrails(theme: Theme, edition: Edition): Seq[Trail] = Seq()
  def getCuratedContent: Map[String, Seq[PressedContent]] = curatedContentAgent.get()
  def getCuratedContentAdFree: Map[String, Seq[PressedContent]] = curatedContentAdFreeAgent.get()
}
