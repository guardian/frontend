package common.Assets

import common.{GuLogging, RelativePathEscaper}
import conf.Configuration
import html.HtmlPageHelpers.{ContentCSSFile, FaciaCSSFile, RichLinksCSSFile}
import model.ApplicationContext
import org.apache.commons.io.IOUtils
import play.api.Mode
import play.api.libs.json._
import play.api.mvc.RequestHeader

import java.nio.charset.Charset
import scala.collection.concurrent.{TrieMap, Map => ConcurrentMap}
import scala.util.{Failure, Success, Try}

// turns an unhashed name into a name that's hashed if it needs to be
class Assets(base: String, mapResource: String, useHashedBundles: Boolean = Configuration.assets.useHashedBundles)
    extends GuLogging {

  lazy val lookup: Map[String, String] = Get(assetMap(mapResource))

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

  def assetMap(resourceName: String): Try[Map[String, String]] = {
    for {
      rawResource <- LoadFromClasspath(resourceName)
      mappings <- jsonToAssetMap(rawResource)
    } yield mappings
  }

}

object inlineSvg {

  private val memoizedSvg: ConcurrentMap[String, Try[String]] = TrieMap()

  def apply(path: String): String =
    Get(memoizedSvg.getOrElseUpdate(path, LoadFromClasspath(s"assets/inline-svgs/$path")))

}

object css {

  private val memoizedCss: ConcurrentMap[String, Try[String]] = TrieMap()

  def head(projectOverride: Option[String])(implicit context: ApplicationContext, request: RequestHeader): String =
    inline(cssHead(projectOverride.getOrElse(context.applicationIdentity.name)))
  def inlineIdentity(implicit request: RequestHeader, context: ApplicationContext): String = inline("head.identity")
  def inlineStoryPackageGarnett(implicit context: ApplicationContext): String = inline("story-package-garnett")
  def inlinePhotoEssayGarnett(implicit context: ApplicationContext): String = inline("article-photo-essay-garnett")
  def amp(implicit context: ApplicationContext): String = inline("head.amp")
  def hostedAmp(implicit context: ApplicationContext): String = inline("head.hosted-amp")
  def liveblogAmp(implicit context: ApplicationContext): String = inline("head.amp-liveblog")
  def emailArticle(implicit context: ApplicationContext): String = inline("head.email-article")
  def emailFront(implicit context: ApplicationContext): String = inline("head.email-front")
  def interactive(implicit context: ApplicationContext): String = inline("head.interactive")
  def inlineAtom(atomType: String)(implicit content: ApplicationContext): String = inline(s"head.atom-$atomType")

  def projectCss(
      projectOverride: Option[String],
  )(implicit context: ApplicationContext, request: RequestHeader): String =
    project(projectOverride.getOrElse(context.applicationIdentity.name))
  def headOldIE(projectOverride: Option[String])(implicit context: ApplicationContext, request: RequestHeader): String =
    cssOldIE(projectOverride.getOrElse(context.applicationIdentity.name))
  def headIE9(projectOverride: Option[String])(implicit context: ApplicationContext, request: RequestHeader): String =
    cssIE9(projectOverride.getOrElse(context.applicationIdentity.name))

  private def inline(module: String)(implicit context: ApplicationContext): String = {
    val resourceName = s"assets/inline-stylesheets/$module.css"
    Get(if (context.environment.mode == Mode.Dev) {
      LoadFromClasspath(resourceName)
    } else {
      memoizedCss.getOrElseUpdate(resourceName, LoadFromClasspath(resourceName))
    })
  }

  private def project(project: String)(implicit request: RequestHeader): String = {
    project match {
      case "facia" => s"stylesheets/$FaciaCSSFile.css"
      case _       => s"stylesheets/$ContentCSSFile.css"
    }
  }

  private def cssHead(project: String)(implicit request: RequestHeader, context: ApplicationContext): String =
    project match {
      case "footballSnaps" => "head.footballSnaps"
      case "facia"         => s"head.$FaciaCSSFile"
      case "identity"      => "head.identity"
      case "football"      => "head.football"
      case "index"         => "head.index"
      case "rich-links"    => s"head.$RichLinksCSSFile"
      case "email-signup"  => "head.email-signup"
      case "commercial"    => "head.commercial"
      case "survey"        => "head.survey"
      case "signup"        => "head.signup"
      case _               => s"head.$ContentCSSFile"
    }

  private def cssOldIE(project: String)(implicit request: RequestHeader): String =
    project match {
      case "facia"    => s"stylesheets/old-ie.head.$FaciaCSSFile.css"
      case "identity" => "stylesheets/old-ie.head.identity.css"
      case "football" => "stylesheets/old-ie.head.football.css"
      case "index"    => "stylesheets/old-ie.head.index.css"
      case _          => s"stylesheets/old-ie.head.$ContentCSSFile.css"
    }

  private def cssIE9(project: String)(implicit request: RequestHeader): String =
    project match {
      case "facia"    => s"stylesheets/ie9.head.$FaciaCSSFile.css"
      case "identity" => "stylesheets/ie9.head.identity.css"
      case "football" => "stylesheets/ie9.head.football.css"
      case "index"    => "stylesheets/ie9.head.index.css"
      case _          => s"stylesheets/ie9.head.$ContentCSSFile.css"
    }

}

object js {
  val curl: String = Get(LoadFromClasspath("assets/curl.js").map(RelativePathEscaper.escapeLeadingDotPaths))
  val polyfillioUrl: String = Get(
    LoadFromClasspath("assets/polyfill.io").map(RelativePathEscaper.escapeLeadingDotPaths),
  ).trim
}

object Get {
  def apply[T](`try`: Try[T]): T =
    `try` match {
      case Success(s) => s
      case Failure(e) => throw e
    }
}

// gets the asset url from the classpath
object LoadFromClasspath {
  def apply(assetPath: String): Try[String] = {
    (Option(this.getClass.getClassLoader.getResource(assetPath)) match {
      case Some(s) => Success(s)
      case None    => Failure(AssetNotFoundException(assetPath))
    }).flatMap { url =>
      Try(IOUtils.toString(url, Charset.defaultCharset()))
    }
  }
}

case class AssetNotFoundException(assetPath: String)
    extends Exception(s"Cannot find asset $assetPath. You should run `make compile`.")
