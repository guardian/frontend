package dev

import akka.stream.scaladsl.StreamConverters
import common.Assets.AssetNotFoundException
import common.ImplicitControllerExecutionContext
import java.io.File

import model.{Cached, NoCache}
import model.Cached.WithoutRevalidationResult
import play.api.{Environment, Mode}
import play.api.http.HttpEntity
import play.api.mvc._

class DevAssetsController(val environment: Environment, val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext {

  // This allows:
  //  - unbuilt javascript to be loaded from src or public folders.
  //  - built css can be loaded from target folder.
  private val findDevAsset: PartialFunction[String, String] = {
    case path if new File(s"static/src/$path").exists()    => s"static/src/$path"
    case path if new File(s"static/vendor/$path").exists() => s"static/vendor/$path"
    case path if new File(s"static/public/$path").exists() => s"static/public/$path"
    case path if new File(s"static/target/$path").exists() => s"static/target/$path"
    case path if new File(s"node_modules/$path").exists()  => s"node_modules/$path"
  }

  // All compiled assets will be loaded from the hash output folder.
  private val findHashedAsset: PartialFunction[String, String] = {
    case path if new File(s"static/hash/$path").exists() => s"static/hash/$path"
  }

  def at(path: String): Action[AnyContent] =
    Action { implicit request =>
      val assetPath = if (conf.Configuration.assets.useHashedBundles) {
        findHashedAsset.lift(path)
      } else {
        findDevAsset.lift(path)
      }

      val file = assetPath.map(path => new File(path))

      val resolved = file map {
        _.toURI.toURL
      } getOrElse {
        throw AssetNotFoundException(path)
      }

      val contentType = controllerComponents.fileMimeTypes
        .forFileName(path)
        .map { mime => if (mime.startsWith("text/")) s"$mime; charset=utf-8" else mime } // Add charset for text types
        .getOrElse(BINARY)

      val result = Result(
        ResponseHeader(OK, Map(CONTENT_TYPE -> contentType)),
        HttpEntity.Streamed(
          data = StreamConverters.fromInputStream(resolved.openStream _),
          contentLength = file.map(_.length),
          contentType = Some(contentType),
        ),
      )

      // WebDriver caches during tests. Caching CSS during tests might speed some things up.
      if (environment.mode == Mode.Test) {
        Cached(84000)(WithoutRevalidationResult(result))
      } else {
        // but we don't want caching during development...
        NoCache(result)
      }
    }

}
