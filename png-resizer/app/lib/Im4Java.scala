package lib

import java.awt.image.BufferedImage
import org.im4java.core.{Stream2BufferedImage, ConvertCmd, IMOperation}
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

object Im4Java {
  def apply(image: BufferedImage, operation: IMOperation, format: String = "png"): Array[Byte] = {
    val cmd = new ConvertCmd(false)
    val s2b = new Stream2BufferedImage
    cmd.setOutputConsumer(s2b)

    cmd.run(operation, image)
    val resized = s2b.getImage

    val baos = new ByteArrayOutputStream
    ImageIO.write(resized, format,  baos)
    baos.flush()
    baos.toByteArray
  }

  def resizeBufferedImage(image: BufferedImage, width: Int, quality: Int) = {
    val operation = new IMOperation

    operation.addImage()
    operation.resize(width)
    operation.quality(quality)
    operation.define("png:color-type=6")  // force rgba colour, iOS does not support indexed (http://en.wikipedia.org/wiki/Portable_Network_Graphics#Color_depth)
    operation.addImage("png:-")

    apply(image, operation)
  }
}
