package controllers.front

import common._
import conf.{ SwitchingContentApi=>ContentApi, Configuration }
import model._
import play.api.libs.json.Json._
import play.api.libs.json._
import play.api.libs.ws.{ WS, Response }
import play.api.libs.json.JsObject
import services.{ParseCollection, ConfigAgentTrait, SecureS3Request, S3FrontsApi}
import scala.concurrent.Future
import common.FaciaMetrics.S3AuthorizationError
import scala.collection.immutable.SortedMap
import akka.agent.Agent
import org.joda.time.DateTime

object ConfigAgent extends ConfigAgentTrait with ExecutionContexts {
  val configAgent: Agent[JsValue] = AkkaAgent[JsValue](FaciaDefaults.getDefaultConfig)
}
