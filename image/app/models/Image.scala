package model

import java.awt.image.BufferedImage
import org.im4java.core.{ IMOperation, ConvertCmd, Stream2BufferedImage }
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

// Image configuration. 
object TrailImage {
  val compression = 70
  val width = 320
  val height = 192 // 5:3
}

object Im4Java {

  def apply(image: BufferedImage, operation:IMOperation, format: String = "jpg"): Array[Byte] = { 
    val cmd = new ConvertCmd
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

