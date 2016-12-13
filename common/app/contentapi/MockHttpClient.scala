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

  override def GET(url: String, headers: Iterable[(String, String)]): Future[Response] = {

    val contentFromFile = (file: File) => Files.readAllBytes(
      java.nio.file.Paths.get(file.getPath)
    )

    def headersFormat(headers: Iterable[(String, String)]): String = {
      headers.toList.sortBy(_._1).map{ case (key, value) => key + value }.mkString
    }

    val url2hash =  (url: String, headers: Iterable[(String, String)]) => {
      val uri = URI.create(url)
      val key = uri.getPath + uri.getQuery + headersFormat(headers)
      DigestUtils.sha256Hex(key)
    }

    val hash = url2hash(url, headers)

    val response = getFile(baseDir, hash) match {
      case Some(file) => Response(contentFromFile(file), 200, "OK")
      case None => throw new Exception("No hashed file found for: " + url)
    }

    Future(response)

  }

}
