package services

import common.{AkkaAgent, ExecutionContexts}
import play.api.libs.json.{JsNull, Json, JsValue}
import model.Config

trait ConfigAgentTrait extends ExecutionContexts {
  private val configAgent = AkkaAgent[JsValue](JsNull)

  def refresh() = S3FrontsApi.getMasterConfig map {s => configAgent.send(Json.parse(s))}

  def getPathIds: List[String] = {
    val json = configAgent.get()
    (json \ "fronts").asOpt[Map[String, JsValue]].map { _.keys.toList } getOrElse Nil
  }

  def getConfigCollectionMap: Map[String, Seq[String]] = {
    val json = configAgent.get()
    (json \ "fronts").asOpt[Map[String, JsValue]].map { m =>
      m.mapValues{j => (j \ "collections").asOpt[Seq[String]].getOrElse(Nil)}
    } getOrElse Map.empty
  }

  def getConfigsUsingCollectionId(id: String): Seq[String] = {
    getConfigCollectionMap.collect{
      case (configId, collectionIds) if collectionIds.contains(id) => configId
    }.toSeq
  }

  def getConfigForId(id: String): Option[List[Config]] = {
    val json = configAgent.get()
    (json \ "fronts" \ id \ "collections").asOpt[List[String]] map { configList =>
      configList flatMap getConfig
    }
  }

  def getConfig(id: String): Option[Config] = {
    val json = configAgent.get()
    (json \ "collections" \ id).asOpt[JsValue] map { collectionJson =>
      Config(
        id,
        (collectionJson \ "apiQuery").asOpt[String],
        (collectionJson \ "displayName").asOpt[String].filter(_.nonEmpty),
        (collectionJson \ "tone").asOpt[String],
        (collectionJson \ "href").asOpt[String],
        (collectionJson \ "groups").asOpt[Seq[String]] getOrElse Nil,
        (collectionJson \ "roleName").asOpt[String]
      )
    }
  }

  def getAllCollectionIds: List[String] = {
    val json = configAgent.get()
    (json \ "collections").asOpt[Map[String, JsValue]] map { collectionMap =>
      collectionMap.keys.toList
    } getOrElse Nil
  }

  def close() = configAgent.close()

  def contentsAsJsonString: String = Json.prettyPrint(configAgent.get)
}
