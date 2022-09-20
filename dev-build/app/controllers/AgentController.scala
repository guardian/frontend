package controllers

import agents.CuratedContentAgent
import services.fronts.FrontJsonFapiLive


class AgentController(frontJsonFapiLive: FrontJsonFapiLive) {
  val curatedContentAgent: CuratedContentAgent = new CuratedContentAgent(frontJsonFapiLive)
}
