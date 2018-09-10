package views.support

import conf.Configuration
import org.apache.commons.codec.digest.DigestUtils.md5Hex

object ImageUrlSigner {
  def sign(path: String): String = {
    val separator = if (path.contains("?")) "&" else "?"
    s"$path${separator}s=${md5Hex(s"${Configuration.images.signatureSalt}$path")}"
  }
}
