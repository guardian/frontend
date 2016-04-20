package recorder

import java.io._
import java.nio.charset.StandardCharsets

import common.ExecutionContexts
import conf.Configuration
import contentapi.Response
import org.apache.commons.codec.digest.DigestUtils

import scala.concurrent.Future
import scala.io.Source


trait HttpRecorder[A] extends ExecutionContexts {

  def baseDir: File

  // loads api call from disk. if it cannot be found on disk go get it and save to disk
  final def load(url: String, headers: Map[String, String] = Map.empty)(fetch: => Future[A]):Future[A] = {

    val fileName = name(url, headers)

    // integration test environment
    // make sure people have checked in test files
    if (Configuration.environment.stage.equalsIgnoreCase("DEVINFRA") && !new File(baseDir, fileName).exists()) {
      throw new IllegalStateException(s"Data file has not been checked in for: $url, file: $fileName, headers: ${headersFormat(headers)}")
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

  private def headersFormat(headers: Map[String, String]): String = {
    headers.map{ case (key, value) => key + value }.mkString
  }

  private [recorder] def name(url: String, headers: Map[String, String]): String = {
    val headersString = headersFormat(headers)
    DigestUtils.sha256Hex(url +  headersString)
  }
}

trait ContentApiHttpRecorder extends HttpRecorder[Response] {

  def toResponse(str: String) = {
    if (str.startsWith("Error:")) {
      Response(Array.empty, str.replace("Error:", "").toInt, "")
    } else {
      Response(str.getBytes(StandardCharsets.UTF_8), 200, "")
    }
  }

  def fromResponse(response: Response) = {
    if (response.status == 200) {
      new String(response.body, StandardCharsets.UTF_8)
    } else {
      s"Error:${response.status}"
    }
  }
}
