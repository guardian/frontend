package common.Assets

import common.Logging
import org.apache.commons.io.IOUtils
import play.api.{ Mode, Play }
import play.api.libs.json.{ JsString, Json, JsObject }
import conf.Configuration
import collection.mutable.{ Map => MutableMap }

case class Asset(path: String) {
  val asModulePath = path.replace(".js", "")
  lazy val md5Key = path.split('.').dropRight(1).last

  override def toString = path
}

class AssetMap(base: String, assetMap: String) {
  def apply(path: String): Asset = {
    // Don't use hashed files in DEV
    if (Play.current.mode == Mode.Dev) Asset(base + path) else memoizedAssets(path)
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

    def head(projectOverride: Option[String] = None) = css(projectOverride.getOrElse(Configuration.environment.projectName))

    // A mutable map of 'project url' keys to 'css content' values
    private val memoizedCss: MutableMap[java.net.URL, String] = MutableMap()

    private def css(project: String): String = {

      val suffix = project match {
        case "facia" => "facia.css"
        case "identity" => "identity.css"
        case default => "css"
      }
      val url = Play.classloader(Play.current).getResource(s"assets/head.$suffix")

      // Reload head css on every access in DEV
      if (Play.current.mode == Mode.Dev) {
        memoizedCss.remove(url)
      }

      memoizedCss.getOrElseUpdate(url, {
        IOUtils.toString(url)
      })
    }

    def oldIePath: String = Configuration.environment.projectName match {
      case "identity" => "stylesheets/old-ie.head.identity.css"
      case _ => "stylesheets/old-ie.head.css"
    }
  }
}
