package common.Assets

import common.Logging
import org.apache.commons.io.IOUtils
import play.api.{ Mode, Play }
import play.api.libs.json.{ JsString, Json, JsObject }
import conf.Configuration

case class Asset(path: String) {
  val asModulePath = path.replace(".js", "")
  lazy val md5Key = path.split('.').dropRight(1).last

  override def toString = path
}

class AssetMap(base: String, assetMap: String) {
  def apply(path: String): Asset = {
    // Reload asset maps on every access in DEV
    if (Play.current.mode == Mode.Dev) assets()(path) else memoizedAssets(path)
  }

  private def assets(): Map[String, Asset] = {
    val url = Play.classloader(Play.current).getResource(assetMap)
    val json = IOUtils.toString(url)
    val js: JsObject = Json.parse(json).asInstanceOf[JsObject]

    val paths = js.fields.toMap mapValues { _.asInstanceOf[JsString].value }

    paths mapValues { path => Asset(base + path) }
  }

  private lazy val memoizedAssets = assets()
}


class Assets(base: String, assetMap: String = "assets/assets.map") extends Logging {
  val lookup = new AssetMap(base, assetMap)
  def apply(path: String): Asset = lookup(path)

  object css {
    // Reload head css on every access in DEV
    def head = if (Play.current.mode == Mode.Dev) css() else memoizedCss

    private def css(): String = {
      val url = Configuration.environment.projectName match {
        case "identity" => Play.classloader(Play.current).getResource("assets/head.identity.min.css")
        case _ => Play.classloader(Play.current).getResource("assets/head.min.css")
      }
      IOUtils.toString(url)
    }
    private lazy val memoizedCss: String = css()

    def oldIePath: String = Configuration.environment.projectName match {
      case "identity" => "stylesheets/old-ie.head.identity.min.css"
      case _ => "stylesheets/old-ie.head.min.css"
    }
  }
}
