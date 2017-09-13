package test

import java.io.{File, OutputStream}

import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{BeforeAndAfterAll, FlatSpec, Matchers}
import recorder.DefaultHttpRecorder

import scala.collection.mutable
import scala.concurrent.Future
import scala.sys.process._


trait AmpValidityTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestExecutionContext
  with ScalaFutures {

  val validatorUri = "https://cdn.ampproject.org/v0/validator.js"

  /**
    * Passes the result of hitting the given url to the amphtml-validator.
    *
    * @param url url of the amp page to validate - the amp query string parameter need not be included
    */
  def testAmpPageValidity(url: String): Unit = {
    val ampUrl = ampifyUrl(url)

    val file: Future[File] = recorder.loadFile(validatorUri) {
      wsClient.url(validatorUri).get()
    }

    whenReady(file) { f =>
      s"The AMP page at $url" should "pass an AMP validator" in getContentString(ampUrl) { content =>

        val commandInputWriter: OutputStream => Unit = writeToProcess(content)
        val output = new StringBuilder

        // Generate a ProcessIO with desired input and no output (error or otherwise)
        val io: ProcessIO = BasicIO(withIn = false, ProcessLogger { line =>
          output.append(line + "\n") // Mutate because we can't return!
          ()
        })
          .withInput(commandInputWriter)

        // Pass the content to the command line tool (external process) via stdin ('-' option)
        val process = s"node_modules/.bin/amphtml-validator --validator_js ${f.getAbsolutePath} -".run(io)

        val exitValue = process.exitValue() // side effect - await for process to finish

        withClue(s"AMP validator for $url should pass.\nHint: Try checking your browser developer console for errors when appending '#development=1' to the failing URL.\nOutput:\n---------\n${output.toString}\n---------\nThe validator process exit value of ") {
          exitValue should be(0)
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
