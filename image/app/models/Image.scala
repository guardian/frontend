package model.image

import java.awt.image.BufferedImage
import org.im4java.core.{GraphicsMagickCmd, IMOperation, Stream2BufferedImage}
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

object Im4Java {

  def apply(image: BufferedImage, operation:IMOperation, format: String = "jpg"): Array[Byte] = {

    // Use GraphicsMagick, which is better supported by CentOS
    val cmd = new GraphicsMagickCmd("convert")
    val s2b = new Stream2BufferedImage
    cmd.setOutputConsumer(s2b)

    cmd.run(operation, image)
    val resized = s2b.getImage()

    val baos = new ByteArrayOutputStream
    ImageIO.write(resized, format,  baos);
    baos.flush
    baos.toByteArray
  }
}

