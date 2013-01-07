package recorder

import java.io.{ FileReader, FileWriter, BufferedWriter, File }
import org.apache.commons.codec.digest.DigestUtils
import io.Source
import com.gu.openplatform.contentapi.connection.HttpResponse

trait HttpRecorder {

  def baseDir: File

  def load(url: String, headers: Map[String, String] = Map.empty)(fetch: => HttpResponse): HttpResponse = {
    val fileName = name(url, headers)
    get(fileName).map { toResponse }.getOrElse {
      val response = fetch
      put(name(url, headers), fromResponse(response))
      response
    }
  }

  if (!baseDir.exists()) {
    baseDir.mkdirs()
    baseDir.mkdir()
  }

  private def put(name: String, value: String) {
    val file = new File(baseDir, name)
    val out = new FileWriter(file)
    out.write(value)
    out.close()
  }

  private def get(name: String): Option[String] = {
    val file = new File(baseDir, name)
    if (file.exists()) {
      Some(Source.fromFile(file).getLines.mkString)
    } else {
      None
    }
  }

  private def toResponse(str: String) = {
    if (str.startsWith("Error:")) {
      HttpResponse("", str.replace("Error:", "").toInt, "")
    } else {
      HttpResponse(str, 200, "")
    }
  }
  private def fromResponse(response: HttpResponse) = {
    if (response.statusCode == 200) {
      response.body
    } else {
      "Error:" + response.statusCode
    }
  }

  private def name(url: String, headers: Map[String, String]) = {
    val urlPart = url.split("\\?").flatMap(_.split("\\&")).sorted.mkString
    val headerPart = headers.toList.map { case (key, value) => key + value }.sorted.mkString
    DigestUtils.shaHex((urlPart + headerPart).getBytes)
  }
}