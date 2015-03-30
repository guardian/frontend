package lib

import java.io.{ByteArrayOutputStream, ByteArrayInputStream}
import common.{ExecutionContexts, Logging}
import org.apache.commons.io.IOUtils
import scala.sys.process._
import scala.io.Source
import scala.concurrent.{Future, blocking}

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

    Future {
      blocking {
        process.run(io).exitValue() match {
          case 0 =>
            baos.flush()
            baos.toByteArray

          case n =>
            log.error(s"pngquant exited with $n status code")
            throw new RuntimeException(s"pngquant exited with $n status code")
        }
      }
    }
  }
}
