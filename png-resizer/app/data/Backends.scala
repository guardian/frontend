package data

import java.net.{URLDecoder, URI}

/** TODO move this to a config file */
object Backends {
  private val all = Map(
    "static" -> new URI("http://static.guim.co.uk"),
    "media" -> new URI("http://media.guim.co.uk"),
    "sport" -> new URI("http://sport.guim.co.uk")
  )

  def uri(backend: String, path: String) = all.get(backend) map { host =>
    new URI(host.getScheme, host.getHost, "/" + URLDecoder.decode(path, "UTF-8"), null).toString
  }
}
