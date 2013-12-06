package recorder

import java.io._
import org.apache.commons.codec.digest.DigestUtils
import io.Source
import com.gu.openplatform.contentapi.connection.HttpResponse
import concurrent.Future
import common.ExecutionContexts
import conf.Configuration


trait HttpRecorder[A] extends ExecutionContexts {

  def baseDir: File

  // loads api call from disk. if it cannot be found on disk go get it and save to disk
  final def load(url: String, headers: Map[String, String] = Map.empty)(fetch: => Future[A]):Future[A] = {

    val fileName = name(url, headers)

    // integration test environment
    // make sure people have checked in test files
    if (Configuration.environment.stage == "DEVINFRA" && !new File(fileName).exists()) {
      throw new IllegalStateException(s"Data file has not been checked in for: $url")
    }

    get(fileName).map { f =>
      val response = toResponse(f)
      Future(response)
    }.getOrElse {
      val response = fetch
      response.foreach(r => put(fileName, fromResponse(r)))
      response
    }
  }

  if (!baseDir.exists()) {
    baseDir.mkdirs()
    baseDir.mkdir()
  }

  private [recorder] def put(name: String, value: String) {
    val file = new File(baseDir, name)
    val out = new OutputStreamWriter(new FileOutputStream(file), "UTF-8")
    out.write(value)
    out.close()
  }

  private [recorder] def get(name: String): Option[String] = {
    val file = new File(baseDir, name)
    if (file.exists()) {
      Some(Source.fromFile(file, "UTF-8").getLines().mkString)
    } else {
      None
    }
  }

  def toResponse(str: String): A

  def fromResponse(response: A): String

  private [recorder] def name(url: String, headers: Map[String, String]) = {
    val urlPart = url.split("\\?").flatMap(_.split("\\&")).sorted.mkString
    val headerPart = headers.toList.map { case (key, value) => key + value }.sorted.mkString
    DigestUtils.shaHex((urlPart + headerPart).getBytes)
  }
}

trait ContentApiHttpRecorder extends HttpRecorder[HttpResponse] {

  def toResponse(str: String) = {
    if (str.startsWith("Error:")) {
      HttpResponse("", str.replace("Error:", "").toInt, "")
    } else {
      HttpResponse(str, 200, "")
    }
  }

  def fromResponse(response: HttpResponse) = {
    if (response.statusCode == 200) {
      response.body
    } else {
      s"Error:${response.statusCode}"
    }
  }
}