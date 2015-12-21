package common.Assets

import java.net.URL
import java.io.File

import common.{Logging, RelativePathEscaper}
import conf.Configuration
import org.apache.commons.io.IOUtils
import play.api.libs.json._
import play.api.{Mode, Play}

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
      assets().getOrElse(path, if (new File(s"static/src/$path").exists()) {
        Asset(path)
      } else {
        throw AssetNotFoundException(path)
      })
    } else {
      memoizedAssets(path)
    }
  }

  def assets(): Map[String, Asset] = {

    // Use the grunt-generated asset map in Dev.
    val json: String = if (Play.current.mode == Mode.Dev) {
      val assetMapUri = new java.io.File(s"static/hash/" + assetMap).toURI
      IOUtils.toString(assetMapUri)
    } else {
      val url = AssetFinder(assetMap)
      IOUtils.toString(url)
    }
    val paths: Map[String, String] = Json.parse(json).validate[Map[String, String]] match {
      case JsSuccess(m, _) => m
      case JsError(_) => Map.empty
    }

    paths mapValues { path => Asset(base + path) }
  }

  private lazy val memoizedAssets = assets()
}

class Assets(base: String, assetMapPath: String = "assets/assets.map") extends Logging {
  val lookup = new AssetMap(base, assetMapPath)
  def apply(path: String): Asset = lookup(path)

  object inlineSvg {

    private val memoizedSvg: ConcurrentMap[String, String] = TrieMap()

    def apply(path: String): String = {

      def loadFromDisk = {
        val url = AssetFinder(s"assets/inline-svgs/$path")
        IOUtils.toString(url)
      }

      memoizedSvg.getOrElseUpdate(path, loadFromDisk)
    }
  }

  object css {

    private val memoizedCss: ConcurrentMap[java.net.URL, String] = TrieMap()

    def projectCss(projectOverride: Option[String]) = project(projectOverride.getOrElse(Configuration.environment.projectName))
    def head(projectOverride: Option[String]) = cssHead(projectOverride.getOrElse(Configuration.environment.projectName))
    def headOldIE(projectOverride: Option[String]) = cssOldIE(projectOverride.getOrElse(Configuration.environment.projectName))
    def headIE9(projectOverride: Option[String]) = cssIE9(projectOverride.getOrElse(Configuration.environment.projectName))

    def inline(module: String): Option[String] = {
       val knownInlines : PartialFunction[String,String] =
       {
         case "story-package" => "story-package.css"
         case "KeepItInTheGround" => "basher.KeepItInTheGround.css"
       }
       knownInlines.lift(module).map { cssModule => loadCssResource(s"assets/inline-stylesheets/$cssModule") }
    }

    private def cssHead(project: String): String = {

      val suffix = project match {
        case "footballSnaps" => "footballSnaps.css"
        case "facia" => "facia.css"
        case "identity" => "identity.css"
        case "football" => "football.css"
        case "index" => "index.css"
        case "rich-links" => "rich-links.css"
        case "email" => "email.css"
        case _ => "content.css"
      }

      loadCssResource(s"assets/inline-stylesheets/head.$suffix")
    }

    private def loadCssResource(resourceName: String): String = {

      val url = AssetFinder(resourceName)

      // Reload css on every access in DEV
      if (Play.current.mode == Mode.Dev) {
        memoizedCss.remove(url)
      }

      memoizedCss.getOrElseUpdate(url, {
        IOUtils.toString(url)
      })
    }

    private def project(project: String): String = {
      project match {
        case "facia" => "stylesheets/facia.css"
        case _ => "stylesheets/content.css"
      }
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
     private def inlineJs(path: String): String = IOUtils.toString(AssetFinder(path))

     val curl: String = RelativePathEscaper.escapeLeadingDotPaths(inlineJs("assets/curl-domReady.js"))
     val omnitureJs: String = inlineJs("assets/vendor/omniture.js")
  }
}

object AssetFinder {
  def apply(assetPath: String): URL = {
    Option(Play.classloader(Play.current).getResource(assetPath)).getOrElse {
      throw AssetNotFoundException(assetPath)
    }
  }
}

case class AssetNotFoundException(assetPath: String) extends Exception {
  override val getMessage: String =
    s"Cannot find asset $assetPath. Have you got the right path? Or do you need to run 'make compile', or 'make compile-dev'?."
}
