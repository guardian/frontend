package dev

import java.io.File
import org.apache.commons.io.IOUtils
import play.api.libs.MimeTypes
import play.api.mvc._

object DevAssetsController extends Controller {

  def at(path: String): Action[AnyContent] = Action {
    val resolved = new File(s"static/target/hashed/$path").toURI.toURL
    val body = IOUtils.toString(resolved)

    val contentType: Option[String] = MimeTypes.forFileName(path) map { mime =>
      // Add charset for text types
      if (MimeTypes.isText(mime)) s"${mime}; charset=utf-8" else mime
    }

    Ok(body).withHeaders(CONTENT_TYPE -> contentType.getOrElse(BINARY))
  }
}