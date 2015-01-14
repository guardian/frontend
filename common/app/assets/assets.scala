package common.Assets

import common.{RelativePathEscaper, Logging}
import org.apache.commons.io.IOUtils
import play.api.{ Mode, Play }
import play.api.libs.json.{ JsString, Json, JsObject }
import conf.Configuration
import scala.collection.concurrent.{Map => ConcurrentMap, TrieMap}

case class Asset(path: String) {
  val asModulePath = path.replace(".js", "")
  lazy val md5Key = path.split('/').dropRight(1).last

  override def toString = path
}

class AssetMap(base: String, assetMap: String) {
  def apply(path: String): Asset = {

    // Avoid memoizing the asset map in Dev.
    if (Play.current.mode == Mode.Dev) {
      assets()(path)
    } else {
      memoizedAssets(path)
    }
  }

  private def assets(): Map[String, Asset] = {

    // Use the grunt-generated asset map in Dev.
    val json: String = if (Play.current.mode == Mode.Dev) {
      val assetMapUri = new java.io.File(s"static/hash/" + assetMap).toURI
      IOUtils.toString(assetMapUri)
    } else {
      val url = Play.classloader(Play.current).getResource(assetMap)
      IOUtils.toString(url)
    }
    val js: JsObject = Json.parse(json).asInstanceOf[JsObject]

    val paths = js.fields.toMap mapValues { _.asInstanceOf[JsString].value }

    paths mapValues { path => Asset(base + path) }
  }

  private lazy val memoizedAssets = assets()
}

class Assets(base: String, assetMap: String = "assets/assets.map") extends Logging {
  val lookup = new AssetMap(base, assetMap)
  def apply(path: String): Asset = lookup(path)

  object inlineSvg {

    private val memoizedSvg: ConcurrentMap[String, String] = TrieMap()

    def apply(path: String): String = {

      def loadFromDisk = {
        val url = Play.classloader(Play.current).getResource(s"assets/inline-svgs/$path")
        IOUtils.toString(url)
      }

      memoizedSvg.getOrElseUpdate(path, loadFromDisk)
    }
  }

  object css {

    private val memoizedCss: ConcurrentMap[java.net.URL, String] = TrieMap()

    def head(projectOverride: Option[String] = None) = css(projectOverride.getOrElse(Configuration.environment.projectName))
    def headOldIE(projectOverride: Option[String] = None) = cssOldIE(projectOverride.getOrElse(Configuration.environment.projectName))
    def headIE9(projectOverride: Option[String] = None) = cssIE9(projectOverride.getOrElse(Configuration.environment.projectName))


    private def css(project: String): String = {

      val suffix = project match {
        case "facia" => "facia.css"
        case "identity" => "identity.css"
        case "football" => "football.css"
        case "index" => "index.css"
        case "flyers" => "flyers.css"
        case _ => "content.css"
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

    private def cssOldIE(project: String): String = {
      project match {
        case "facia" => "stylesheets/old-ie.head.facia.css"
        case "identity" => "stylesheets/old-ie.head.identity.css"
        case "football" => "stylesheets/old-ie.head.football.css"
        case "index" => "stylesheets/old-ie.head.index.css"
        case _ => "stylesheets/old-ie.head.content.css"
      }
    }
    private def cssIE9(project: String): String = {
      project match {
        case "facia" => "stylesheets/ie9.head.facia.css"
        case "identity" => "stylesheets/ie9.head.identity.css"
        case "football" => "stylesheets/ie9.head.football.css"
        case "index" => "stylesheets/ie9.head.index.css"
        case _ => "stylesheets/ie9.head.content.css"
      }
    }
  }

  object js {
    lazy val curl: String =
      RelativePathEscaper.escapeLeadingDotPaths(
        IOUtils.toString(Play.classloader(Play.current).getResource(s"assets/curl-domReady.js"))
      )
  }

}
