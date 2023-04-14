package common.dfp

import common.Box
import common.dfp._
import common.GuLogging
import org.joda.time.DateTime
import play.api.libs.json.Json.{toJson, _}
import services.S3
import scala.io.Codec.UTF8
import play.api.libs.json._
import scala.util.{Failure, Success, Try}
import conf.{Configuration}
import services.ParameterStore

import scala.concurrent.{ExecutionContext, Future}

object RemoteBundleAgent {
  // Retrieve the name of the static assets bucket from Parameter Store
  private lazy val parameterStore = new ParameterStore(Configuration.aws.region)

  private val bucket = parameterStore.get("/account/services/dotcom-static.bucket")

  // TODO can we compute this URL?
  private val assetMapKey = "CODE/frontend-static/test_commercial_bundles/assets.map"

  private val commmercialBundleEntrypoint = "commercial-standalone.js"

  private lazy val remoteBundleAgent = Box[Option[String]](None)

  def jsonToAssetMap(json: String): Option[Map[String, String]] =
    Json.parse(json).validate[Map[String, String]] match {
      case JsSuccess(m, _) => Some(m)
      case JsError(_)      => None
    }

  private def grabRemoteBundleUrlFromStore(): Option[String] = {
    val commercialBundleUrl: Option[String] =
      S3.get(assetMapKey, bucket)(UTF8)
        .flatMap(jsonToAssetMap)
        .flatMap(assetMap => assetMap.get(commmercialBundleEntrypoint))
        // TODO can we compute this URL?
        .map(url => "https://assets-code.guim.co.uk/test_commercial_bundles/" + url)

    // TODO Remove this later
    println(s"Grabbing remote bundle URL from S3. Found: ${commercialBundleUrl.getOrElse("nothing")}")

    commercialBundleUrl
  }

  def refresh() = {
    remoteBundleAgent.send(grabRemoteBundleUrlFromStore())
  }

  def commercialBundleUrl(): Option[String] = remoteBundleAgent.get()
}
