package contentapi

import java.io.File
import java.net.URI
import java.nio.file.Files

import org.apache.commons.codec.digest.DigestUtils

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class MockHttpClient extends HttpClient {

  lazy val baseDir = new File(System.getProperty("user.dir"), "data/database")

  def getFile(baseDir: File, name: String): Option[File] = {

    val file = new File(baseDir, name)

    if (file.exists()) {
      Some(file)
    } else {
      None
    }

  }

  def name(url: String, headers: Map[String, String]): (String, String) = {

    def headersFormat(headers: Map[String, String]): String = {
      headers.toList.sortBy(_._1).map{ case (key, value) => key + value }.mkString
    }

    val uri = URI.create(url)
    val key = uri.getPath + uri.getQuery + headersFormat(headers)

    (DigestUtils.sha256Hex(key), key)

  }

  override def GET(url: String, headers: Iterable[(String, String)]): Future[Response] = {

    val contentFromFile = (file: File) => Files.readAllBytes(
      java.nio.file.Paths.get(file.getPath)
    )

    val response = getFile(baseDir, "93ae7c215a04fa59f720faaffb9d91f61f50c1cbe416905964b782c5eef0a27f") match {
      case Some(file) => Response(contentFromFile(file), 200, "OK")
      case None => throw new Exception("No data found")
    }

    Future(response)

  }

}
