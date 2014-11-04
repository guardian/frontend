package lib

import java.io.{ByteArrayOutputStream, ByteArrayInputStream}
import org.apache.commons.io.{IOUtils}
import scala.sys.process._


object PngQuant {

  def apply(image: Array[Byte], quality: Int) = {
    val options = Seq("-q", "80", "-")
    val process = Process("pngquant", options)
    val baos = new ByteArrayOutputStream
    val bais = new ByteArrayInputStream(image)
    val io = new ProcessIO (
      in => { IOUtils.copy(bais, in)  },
      out => { IOUtils.copy(out, baos) },
      err => { scala.io.Source.fromInputStream(err).getLines.foreach(println)}
    )

    process.run(io)

    baos.flush
    baos.toByteArray
  }

}
