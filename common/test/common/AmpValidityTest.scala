package test

import java.io.{File, OutputStream}

import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{BeforeAndAfterAll, FlatSpec, Matchers}
import recorder.DefaultHttpRecorder

import scala.concurrent.Future
import scala.sys.process._


trait AmpValidityTest extends FlatSpec with Matchers with ConfiguredTestSuite with BeforeAndAfterAll with WithTestWsClient with ScalaFutures {

  val validatorUri = "https://cdn.ampproject.org/v0/validator.js"

  /**
    * Passes the result of hitting the given url to the amphtml-validator.
    *
    * @param url url of the amp page to validate - the amp query string parameter need not be included
    */
  def testAmpPageValidity(url: String): Unit = {
    val ampUrl = ampifyUrl(url)

    val future: Future[File] = recorder.loadFile(validatorUri) {
      wsClient.url(validatorUri).get()
    }

    whenReady(future) { file =>
      s"The AMP page at $url" should "pass an AMP validator" in getContentString(ampUrl) { content =>

        val commandInputWriter: OutputStream => Unit = writeToProcess(content)

        // Generate a ProcessIO with desired input and no output (error or otherwise)
        val io: ProcessIO = BasicIO(withIn = false, ProcessLogger((_) => ()))
          .withInput(commandInputWriter)

        // Pass the content to the command line tool (external process) via stdin ('-' option)
        val process = s"node_modules/.bin/amphtml-validator --validator_js ${file.getAbsolutePath} -".run(io)

        withClue("AMP validator should complete with exit value 0, the actual exit value of ") {
          process.exitValue() should be(0)
        }
      }
    }
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
