import java.net.URL

package object feed {
  def urlToContentPath(url: String): String = {
    val path = new URL(url).getPath
    if (path.startsWith("/")) path.substring(1) else path
  }
}
