package common.Assets

import java.net.URL

import common.{Logging, RelativePathEscaper}
import conf.Configuration
import model.ApplicationContext
import org.apache.commons.io.IOUtils
import play.api.libs.json._
import play.api.Mode

import scala.collection.concurrent.{TrieMap, Map => ConcurrentMap}
import scala.util.{Failure, Success, Try}

// turns an unhashed name into a name that's hashed if it needs to be
class Assets(base: String, mapResource: String, useHashedBundles: Boolean = Configuration.assets.useHashedBundles) extends Logging {

  lazy val lookup: Map[String, String] = assetMap(mapResource) match {
    case Success(s) => s
    case Failure(e) => throw e
  }

  def apply(path: String): String = {
    val target =
      if (useHashedBundles) {
        lookup.getOrElse(path, throw AssetNotFoundException(path))
      } else {
        path
      }
    base + target
  }

  def jsonToAssetMap(json: String): Try[Map[String, String]] =
    Json.parse(json).validate[Map[String, String]] match {
      case JsSuccess(m, _) => Success(m)
      case JsError(errors) => Failure(new Exception(s"$errors"))
    }

  def assetMap(resourceName: String): Try[Map[String, String]] = jsonToAssetMap(AssetLoader.loadFromClasspath(resourceName))

}

object inlineSvg {
  def apply(path: String): String = AssetLoader.loadMemoized(s"assets/inline-svgs/$path")
}

object css {

  def head(projectOverride: Option[String])(implicit context: ApplicationContext) = inline(cssHead(projectOverride.getOrElse(context.applicationIdentity.name)))
  def inlineStoryPackage(implicit context: ApplicationContext) = inline("story-package")
  def inlineExplore(implicit context: ApplicationContext) = inline("article-explore")
  def inlinePhotoEssay(implicit context: ApplicationContext) = inline("article-photo-essay")
  def amp(implicit context: ApplicationContext) = inline("head.amp")
  def hostedAmp(implicit context: ApplicationContext) = inline("head.hosted-amp")
  def liveblogAmp(implicit context: ApplicationContext) = inline("head.amp-liveblog")
  def emailArticle(implicit context: ApplicationContext) = inline("head.email-article")
  def emailFront(implicit context: ApplicationContext) = inline("head.email-front")
  def interactive(implicit context: ApplicationContext) = inline("head.interactive")

  def projectCss(projectOverride: Option[String])(implicit context: ApplicationContext) = project(projectOverride.getOrElse(context.applicationIdentity.name))
  def headOldIE(projectOverride: Option[String])(implicit context: ApplicationContext) = cssOldIE(projectOverride.getOrElse(context.applicationIdentity.name))
  def headIE9(projectOverride: Option[String])(implicit context: ApplicationContext) = cssIE9(projectOverride.getOrElse(context.applicationIdentity.name))


  def inline(module: String)(implicit context: ApplicationContext): String = AssetLoader.load(s"assets/inline-stylesheets/$module.css")

  private def project(project: String): String = {
    project match {
      case "facia" => "stylesheets/facia.css"
      case _ => "stylesheets/content.css"
    }
  }

  private def cssHead(project: String): String =
    project match {
      case "footballSnaps" => "head.footballSnaps"
      case "facia" => "head.facia"
      case "identity" => "head.identity"
      case "football" => "head.football"
      case "index" => "head.index"
      case "rich-links" => "head.rich-links"
      case "email-signup" => "head.email-signup"
      case "commercial" => "head.commercial"
      case "survey" => "head.survey"
      case "signup" => "head.signup"
      case _ => "head.content"
    }

  private def cssOldIE(project: String): String =
    project match {
      case "facia" => "stylesheets/old-ie.head.facia.css"
      case "identity" => "stylesheets/old-ie.head.identity.css"
      case "football" => "stylesheets/old-ie.head.football.css"
      case "index" => "stylesheets/old-ie.head.index.css"
      case _ => "stylesheets/old-ie.head.content.css"
    }

  private def cssIE9(project: String): String =
    project match {
      case "facia" => "stylesheets/ie9.head.facia.css"
      case "identity" => "stylesheets/ie9.head.identity.css"
      case "football" => "stylesheets/ie9.head.football.css"
      case "index" => "stylesheets/ie9.head.index.css"
      case _ => "stylesheets/ie9.head.content.css"
    }

}

object js {
  val curl: String = RelativePathEscaper.escapeLeadingDotPaths(AssetLoader.loadFromClasspath("assets/curl.js"))
  val polyfillioUrl: String = RelativePathEscaper.escapeLeadingDotPaths(AssetLoader.loadFromClasspath("assets/polyfill.io")).trim
}

case class AssetNotFoundException(assetPath: String) extends Exception(s"Cannot find asset $assetPath. You should run `make compile`.")

object AssetLoader {

  private val memoizedAssets: ConcurrentMap[String, String] = TrieMap()

  def load(assetPath: String)(implicit context: ApplicationContext): String = {
    if (context.environment.mode == Mode.Dev) {
      loadFromClasspath(assetPath)
    } else {
      loadMemoized(assetPath)
    }
  }

  def loadMemoized(assetPath: String): String = memoizedAssets.getOrElseUpdate(assetPath, loadFromClasspath(assetPath))

  def loadFromClasspath(assetPath: String): String = {
    val assetUrl: Option[URL]  = Option(this.getClass.getClassLoader.getResource(assetPath))
    assetUrl.map(url => Try(IOUtils.toString(url))) match {
      case Some(Success(s)) => s
      case Some(Failure(e)) => throw e
      case None => throw AssetNotFoundException(assetPath)
    }
  }
}

