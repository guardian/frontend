package assets

import common.{Properties, Logging}
import java.io.File
import java.net.{ URLConnection, URL }
import java.util.jar.JarFile
import play.api.{ Mode, Play, Plugin, Application }
import scala.collection.JavaConversions._
import scala.language.reflectiveCalls

object `package` {

  implicit class ListOfMaps2DuplicateKeys[K, V](maps: List[Map[K, V]]) {
    def duplicateKeys: Set[K] = {
      val keys = (maps flatMap { _.keySet })
      val keyInstances = keys groupBy { k => k }
      (keyInstances filter { case (key, instances) => instances.length > 1 }).keySet
    }
  }

  object ClassLoaders {
    def play(): ClassLoader = Play.classloader(Play.current)
  }

  object URLConnections {
    def setDefaultUseCaches(useCaches: Boolean) {
      // Yes... I can't believe it's not static.
      val connectionInstance: URLConnection = ClassLoaders.play().getResource("java/lang/System.class").openConnection()
      connectionInstance.setDefaultUseCaches(useCaches)
    }
  }
}

class AssetsPlugin(val app: Application) extends Plugin with Logging {
  override def onStart() {
    // Trap: The following has global application and may interfere with caching on non-local fetching
    // http://stackoverflow.com/questions/1374438/disappearing-jar-entry-when-loading-using-spi
    log.warn("Disabling caching on UrlConnection for Play DEV mode asset jar reloading.")
    URLConnections.setDefaultUseCaches(false)
  }

  private val reloadAssetMapsOnAccess = app.mode == Mode.Dev

  def getAssetMappings(base: String = ""): String => String = {
    reloadAssetMapsOnAccess match {
      case true =>
        asset: String => loadAssetMappings(base)(asset)

      case false =>
        val cachedMappings = loadAssetMappings(base)
        asset: String => cachedMappings(asset)
    }
  }

  private def loadAssetMappings(base: String = ""): Map[String, String] = {
    val assetMaps = assetMapResources() map { Properties(_) }

    // You determine a precedence order here if you like...
    val keyCollisions = assetMaps.duplicateKeys
    if (!keyCollisions.isEmpty) {
      log.error("Static asset collisions detected. Are you trying to override existing assets?")
      throw new RuntimeException("Assetmap collisions for: " + keyCollisions.toList.sorted.mkString(", "))
    }

    assetMaps reduceLeft { _ ++ _ } mapValues { base + _ }
  }

  private val JarFilePattern = """jar:file:(.*)!/(.*)""".r
  private val FilePattern = """file:(.*)""".r

  // Get files with '/assetmap/' prefix from any local location or jar on classpath
  private def assetMapResources(): List[URL] = {
    (ClassLoaders.play().getResources("assetmaps").toList flatMap { list }).distinct
  }

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

      entries filter { _.getName contains relativePath } map {
        entry => new URL("jar:file:%s!/%s".format(path, entry))
      }

    case _ => List()
  }
}
