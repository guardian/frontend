package cache

import model.Content
import org.apache.commons.codec.digest.DigestUtils
import play.api.mvc.RequestHeader

object SurrogateKey {

  def apply(s: String): String = DigestUtils.md5Hex(s)
  def apply(request: RequestHeader): String = this(request.path)
  def apply(c: Content): String = this(s"/${c.id}")
}
