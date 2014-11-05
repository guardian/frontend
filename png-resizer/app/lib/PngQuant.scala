package lib

import java.io.{ByteArrayOutputStream, ByteArrayInputStream}
import common.{ExecutionContexts, Logging}
import org.apache.commons.io.IOUtils
import scala.concurrent.{Future, blocking}
import scala.sys.process._
import scala.io.Source

object PngQuant extends Logging with ExecutionContexts {
  def apply(image: Array[Byte], quality: Int) = {
    val options = Seq("-q", "100", "-")
    val process = Process("pngquant", options)
    val baos = new ByteArrayOutputStream
    val bais = new ByteArrayInputStream(image)
    val io = new ProcessIO (
      { in =>
        IOUtils.copy(bais, in)
        in.close()
      },
      { out =>
        IOUtils.copy(out, baos)
        out.close()
      },
      { err =>
        Source.fromInputStream(err).getLines() foreach { line =>
          log.error(line)
        }
        err.close()
      }
    )

    val runningProcess = process.run(io)

    Future {
      blocking {
        /** Block until the process is complete
          *
          * TODO: is there an asynchronous library for interacting with processes?
          */
        runningProcess.exitValue()

        baos.flush()
        baos.toByteArray
      }
    }
  }
}
