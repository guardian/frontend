package lib

import java.io.{ByteArrayOutputStream, ByteArrayInputStream}
import common.{ExecutionContexts, Logging}
import org.apache.commons.io.IOUtils
import scala.concurrent.Promise
import scala.sys.process._
import scala.io.Source

object PngQuant extends Logging with ExecutionContexts {
  def apply(image: Array[Byte], quality: Int) = {
    val options = Seq("-q", "80", "-")
    val process = Process("pngquant", options)
    val baos = new ByteArrayOutputStream
    val bais = new ByteArrayInputStream(image)

    val promiseOfImage = Promise[Array[Byte]]()

    val io = new ProcessIO (
      { in =>
        IOUtils.copy(bais, in)
        in.close()
      },
      { out =>
        IOUtils.copy(out, baos)
        out.close()
        baos.flush()
        promiseOfImage.success(baos.toByteArray)
      },
      { err =>
        Source.fromInputStream(err).getLines() foreach { line =>
          log.error(line)
        }
        err.close()
      }
    )

    process.run(io)
    promiseOfImage.future
  }
}
