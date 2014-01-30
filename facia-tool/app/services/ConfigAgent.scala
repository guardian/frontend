package services
import common.{AkkaAgent, ExecutionContexts}
import play.api.libs.json.{JsValue, JsNull}
import akka.agent.Agent

object ConfigAgent extends ConfigAgentTrait with ExecutionContexts {
  val configAgent: Agent[JsValue] = AkkaAgent[JsValue](JsNull)
}