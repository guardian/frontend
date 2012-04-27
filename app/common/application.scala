package common

import play.api.Logger
import java.net.URL
import java.io.File
import java.util.jar.JarFile
import scala.collection.JavaConversions._

trait Logging {
  implicit val log = Logger(getClass)
}

object Resources {
  private val JarFilePattern = "jar:file:(.*)!/(.*)".r
  private val FilePattern = "file:(.*)".r

  private val classloader = getClass.getClassLoader

  // Get resources with 'path' prefix from any local location or jar on classpath
  def apply(path: String): List[URL] = classloader.getResources(path).toList flatMap { list }

  private def list(url: URL): List[URL] = url.toString match {
    case FilePattern(relativePath) =>
      val directory = new File(relativePath)
      val listing = directory.listFiles.toList

      listing flatMap {
        case subDirectory if subDirectory.isDirectory => list(new URL("file:" + subDirectory))
        case file => List(new URL("file:" + file))
      }

    case JarFilePattern(path, relativePath) =>
      val jarFile = new JarFile(path)
      val entries = jarFile.entries.toList filter { !_.isDirectory }

      entries filter { _.getName contains relativePath } map { entry => new URL("jar:file:%s!/%s".format(path, entry)) }

    case _ => List()
  }
}

