package views.support

import org.apache.commons.codec.digest.DigestUtils.md5Hex

object ImageUrlSigner {
  def sign(path: String, token: String): String = {
    val separator = if (path.contains("?")) "&" else "?"
    s"$path${separator}s=${md5Hex(s"$token$path")}"
  }
}
