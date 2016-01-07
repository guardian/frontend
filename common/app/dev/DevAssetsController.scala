package dev

import common.Assets.{AssetNotFoundException, Asset}
import common.ExecutionContexts
import java.io.File
import play.api.libs.MimeTypes
import play.api.mvc._
import play.api.libs.iteratee.Enumerator
import play.Play

object DevAssetsController extends Controller with ExecutionContexts {
  // This asset map is used for finding files on local disk.
  private val localAssets = new common.Assets.Assets(base = "")

  private val findDevAsset: PartialFunction[String, String] = {
    case path if new File(s"static/hash/$path").exists() => s"static/hash/$path"
    case path if new File(s"static/src/$path").exists() => s"static/src/$path"
    case path if new File(s"static/public/$path").exists() => s"static/public/$path"
  }

  def at(path: String): Action[AnyContent] = Action { implicit request =>
    val contentType: Option[String] = MimeTypes.forFileName(path) map { mime =>
      // Add charset for text types
      if (MimeTypes.isText(mime)) s"${mime}; charset=utf-8" else mime
    }

    // In dev mode we must consistently reload the asset map, to account for changes to the map.
    val resolvedPath = findDevAsset.lift(
      localAssets.lookup
        .assets()
        .get(path)
        .map(_.path)
        .getOrElse(path)
    ).getOrElse {
      throw AssetNotFoundException(path)
    }

    val resolved = new File(resolvedPath).toURI.toURL

    Result(
      ResponseHeader(OK, Map(CONTENT_TYPE -> contentType.getOrElse(BINARY))),
      Enumerator.fromStream(resolved.openStream())
    )
  }

  def surveys(file: String): Action[AnyContent] =
    controllers.Assets.at(path = "/public/surveys", file, aggressiveCaching = false)
}
