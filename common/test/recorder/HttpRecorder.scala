package recorder

import java.io.{ FileReader, FileWriter, BufferedWriter, File }
import org.apache.commons.codec.digest.DigestUtils
import io.Source

trait NamingStrategy {
  def name(url: String, headers: Map[String, String]): String
}

trait PersistenceStrategy {
  def put(name: String, value: String)
  def get(name: String): Option[String]
}

trait HttpRecorder[R] extends NamingStrategy with PersistenceStrategy {

  def toResponse(body: String): R
  def fromResponse(response: R): String

  def load(url: String, headers: Map[String, String] = Map.empty)(fetch: => R): R = {
    val fileName = name(url, headers)
    get(fileName).map { toResponse }.getOrElse {
      val response = fetch
      put(name(url, headers), fromResponse(response))
      response
    }
  }
}

trait HashedNames extends NamingStrategy {
  def name(url: String, headers: Map[String, String]) = {
    val urlPart = url.split("\\?").flatMap(_.split("\\&")).sorted.mkString
    val headerPart = headers.toList.map { case (key, value) => key + value }.sorted.mkString
    DigestUtils.shaHex((urlPart + headerPart).getBytes)
  }
}

trait FilePersistence extends PersistenceStrategy {

  def baseDir: File

  if (!baseDir.exists()) {
    baseDir.mkdirs()
    baseDir.mkdir()
  }

  def put(name: String, value: String) {
    val file = new File(baseDir, name)
    val out = new FileWriter(file)
    out.write(value)
    out.close()
  }

  def get(name: String): Option[String] = {
    val file = new File(baseDir, name)
    if (file.exists()) {
      Some(Source.fromFile(file).getLines.mkString)
    } else {
      None
    }
  }
}