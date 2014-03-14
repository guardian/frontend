package controllers.front

import common._
import play.api.libs.json._
import services.ConfigAgentTrait
import akka.agent.Agent

object ConfigAgent extends ConfigAgentTrait with ExecutionContexts {
  val configAgent: Agent[JsValue] = AkkaAgent[JsValue](FaciaDefaults.getDefaultConfig)
}
