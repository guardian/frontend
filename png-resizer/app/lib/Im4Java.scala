package lib

import java.io.{ByteArrayInputStream, ByteArrayOutputStream}

import org.im4java.core.{Info, ConvertCmd, IMOperation}
import org.im4java.process.Pipe

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.blocking

object Im4Java {
  def apply(operation: IMOperation, format: String = "png")(imageBytes: Array[Byte]): Array[Byte] = {
    val cmd = new ConvertCmd(false)

    val pipeIn = new Pipe(new ByteArrayInputStream(imageBytes), null)
    cmd.setInputProvider(pipeIn)

    val baos = new ByteArrayOutputStream
    val s2b = new Pipe(null, baos)
    cmd.setOutputConsumer(s2b)

    blocking {
      cmd.run(operation)
    }

    baos.flush()
    baos.toByteArray
  }

  def resizeBufferedImage(width: Int)(imageBytes: Array[Byte]) = Future {
    val operation = new IMOperation

    operation.addImage("-")
    operation.resize(width)
    operation.sharpen(1.0)
    operation.quality(0)
    operation.addImage("png:-")

    apply(operation)(imageBytes)
  }

  def getWidth(imageBytes: Array[Byte]) = Future {
    val imageInfo = new Info("png:-", new ByteArrayInputStream(imageBytes),true)
    (imageInfo.getImageWidth, imageInfo.getImageHeight)
  }

}
