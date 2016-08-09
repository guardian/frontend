package test

import java.io.OutputStream

import org.scalatest.{FlatSpec, Matchers}

import scala.sys.process._


trait AmpValidityTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  /**
    * Passes the result of hitting the given url to the amphtml-validator.
    * @param url url of the amp page to validate - the amp query string parameter need not be included
    */
  def testAmpPageValidity(url: String): Unit = {
    val ampUrl = formatAmpUrl(url)

    s"The AMP page at $url" should "pass an AMP validator" in getContentString(ampUrl) { content =>

      val commandInputWriter: OutputStream => Unit = writeToProcess(content)

      // The process fails when not using stdout/stderr, but these may prove useful for debugging anyway
      val io = new ProcessIO(commandInputWriter, BasicIO.toStdOut, BasicIO.toStdErr)

      // Pass the content to the command line tool (external process) via stdin ('-' option)
      val process = "node_modules/amphtml-validator/index.sh -".run(io)

      withClue("AMP validator should complete with exit value 0, the actual exit value of ") {
        process.exitValue() should be(0)
      }
    }
  }

  private def writeToProcess(str: String)(out: OutputStream): Unit = {
    out.write(str.getBytes)
    out.close()
  }

  // This is too simplistic, but all we need for now.
  // It should be replaced if support for urls with existing params is needed.
  private def formatAmpUrl(url: String): String = {
    url + "?amp"
  }
}
