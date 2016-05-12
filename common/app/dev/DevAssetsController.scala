package dev

import common.Assets.AssetNotFoundException
import common.ExecutionContexts
import java.io.File
import play.api.libs.MimeTypes
import play.api.mvc._
import play.api.libs.iteratee.Enumerator

object DevAssetsController extends Controller with ExecutionContexts {

  // This allows:
  //  - unbuilt javascript to be loaded from src or public folders.
  //  - built css can be loaded from target folder.
  private val findDevAsset: PartialFunction[String, String] = {
    case path if new File(s"static/src/$path").exists() => s"static/src/$path"
    case path if new File(s"static/public/$path").exists() => s"static/public/$path"
    case path if new File(s"static/target/$path").exists() => s"static/target/$path"
  }

  // All compiled assets will be loaded from the hash output folder.
  private val findHashedAsset: PartialFunction[String, String] = {
    case path if new File(s"static/hash/$path").exists() => s"static/hash/$path"
  }

  def at(path: String): Action[AnyContent] = Action { implicit request =>

    val assetPath = if (conf.Configuration.assets.useHashedBundles) {
      findHashedAsset.lift(path)
    } else {
      findDevAsset.lift(path)
    }

    val resolved = assetPath map {
        new File(_).toURI.toURL
      } getOrElse {
        throw AssetNotFoundException(path)
      }

    val contentType = MimeTypes.forFileName(path) map { mime =>
      // Add charset for text types
      if (MimeTypes.isText(mime)) s"$mime; charset=utf-8" else mime
    } getOrElse BINARY

    Result(
      ResponseHeader(OK, Map(CONTENT_TYPE -> contentType)),
      Enumerator.fromStream(resolved.openStream())
    )
  }

  def surveys(file: String): Action[AnyContent] =
    controllers.Assets.at(path = "/public/surveys", file, aggressiveCaching = false)
}
