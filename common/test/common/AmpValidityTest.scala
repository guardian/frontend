package test

import java.io.{File, OutputStream}

import org.scalatest.{BeforeAndAfterAll, FlatSpec, Matchers}
import recorder.DefaultHttpRecorder

import scala.sys.process._


trait AmpValidityTest extends FlatSpec with Matchers with ConfiguredTestSuite with BeforeAndAfterAll with WithTestWsClient {

  val validatorUri = "https://cdn.ampproject.org/v0/validator.js"

  /**
    * Passes the result of hitting the given url to the amphtml-validator.
    *
    * @param url url of the amp page to validate - the amp query string parameter need not be included
    */
  def testAmpPageValidity(url: String): Unit = {
    val ampUrl = ampifyUrl(url)

    s"The AMP page at $url" should "pass an AMP validator" in getContentString(ampUrl) { content =>

      val commandInputWriter: OutputStream => Unit = writeToProcess(content)

      // The process fails when not using stdout/stderr, but these may prove useful for debugging anyway
      val io = new ProcessIO(commandInputWriter, BasicIO.toStdOut, BasicIO.toStdErr)

      // Pass the content to the command line tool (external process) via stdin ('-' option)
      val process = s"node_modules/.bin/amphtml-validator --validator_js ${fetchValidator()} -".run(io)

      withClue("AMP validator should complete with exit value 0, the actual exit value of ") {
        process.exitValue() should be(0)
      }
    }
  }

  private def fetchValidator(): String = {
    recorder.load(validatorUri) {
      wsClient.url(validatorUri).get()
    }
    recorder.fileLocation(validatorUri)
  }

  private def writeToProcess(str: String)(out: OutputStream): Unit = {
    out.write(str.getBytes)
    out.close()
  }

  // This is too simplistic, but all we need for now.
  // It should be replaced if support for urls with existing params is needed.
  private def ampifyUrl(url: String): String = {
    url + "?amp"
  }

  val recorder = new DefaultHttpRecorder {
    override lazy val baseDir = new File(System.getProperty("user.dir"), "data/amp-validator")
  }
}
