package common.dfp

import common.Box
import common.GuLogging
import play.api.libs.json.Json.toJson
import services.S3
import scala.io.Codec.UTF8
import play.api.libs.json._
import conf.{Configuration}
import services.ParameterStore

import scala.concurrent.{ExecutionContext, Future}

object RemoteBundleAgent {
  private val commercialPath = "test_commercial_bundles"

  private val assetMapKey = s"CODE/frontend-static/${commercialPath}/assets.map"

  private val commmercialBundleEntrypoint = "commercial-standalone.js"

  private lazy val remoteBundleAgent = Box[Option[String]](None)

  private def jsonToAssetMap(json: String): Option[Map[String, String]] =
    Json.parse(json).validate[Map[String, String]] match {
      case JsSuccess(m, _) => Some(m)
      case JsError(_)      => None
    }

  private def fullUrl(url: String): String = {
    // TODO what about PROD and dev?
    s"https://assets-code.guim.co.uk/${commercialPath}/${url}"
  }

  private def grabRemoteBundleUrlFromStore(): Option[String] = {
    // Retrieve the name of the static assets bucket from Parameter Store
    val parameterStore = new ParameterStore(Configuration.aws.region)
    val bucket = parameterStore.get("/account/services/dotcom-static.bucket")

    val commercialBundleUrl: Option[String] =
      S3.get(assetMapKey, bucket)(UTF8)
        .flatMap(jsonToAssetMap)
        .flatMap(assetMap => assetMap.get(commmercialBundleEntrypoint))
        .map(fullUrl)

    // TODO Remove this later
    println(s"Grabbing remote bundle URL from S3. Found: ${commercialBundleUrl
      .getOrElse("nothing")}\n ${assetMapKey} ${bucket} ${S3.get(assetMapKey, bucket)(UTF8)}")

    commercialBundleUrl
  }

  def refresh() = {
    remoteBundleAgent.send(grabRemoteBundleUrlFromStore())
  }

  def commercialBundleUrl(): Option[String] = remoteBundleAgent.get()
}
