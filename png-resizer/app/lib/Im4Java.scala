package lib

import java.awt.image.BufferedImage
import org.im4java.core.{Stream2BufferedImage, ConvertCmd, IMOperation}
import java.io.{ByteArrayInputStream, ByteArrayOutputStream}
import javax.imageio.ImageIO

import org.im4java.process.Pipe

object Im4Java {
  def apply(operation: IMOperation, format: String = "png")(imageBytes: Array[Byte]): Array[Byte] = {
    val cmd = new ConvertCmd(false)

    val pipeIn = new Pipe(new ByteArrayInputStream(imageBytes), null)
    cmd.setInputProvider(pipeIn)

    val baos = new ByteArrayOutputStream
    val s2b = new Pipe(null, baos)
    cmd.setOutputConsumer(s2b)

    cmd.run(operation)

    baos.flush()
    baos.toByteArray
  }

  def resizeBufferedImage(width: Int) = {
    val operation = new IMOperation

    operation.addImage("-")
    operation.sharpen(1.0)
    operation.resize(width)
    operation.quality(100)
    operation.addImage("png:-")

    apply(operation)_
  }
}
