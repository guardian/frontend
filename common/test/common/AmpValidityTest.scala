package test

import java.io.OutputStream

import org.scalatest.{FlatSpec, Matchers}

import scala.sys.process._


trait AmpValidityTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  def testAmpValidityURL(url: String): Unit = {
    s"The AMP page at: $url" should "pass an AMP validator" in getContentString(url) { content =>

      val commandInputWriter = writeToProcess(content) _

      // The process fails when not using stdout/stderr, but these may prove useful for debugging anyway
      val io = new ProcessIO(commandInputWriter, BasicIO.toStdOut, BasicIO.toStdErr)
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
}
