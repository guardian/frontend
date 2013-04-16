package model

import java.awt.image.BufferedImage
import org.im4java.core.{ IMOperation, ConvertCmd, Stream2BufferedImage }
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO


case class ImageProfile(width: Int = 50, height: Int = 50, compression: Int = 50) {}

// Configuration of our different image profiles
object Contributor extends ImageProfile(140, 140, 70) {}
object Gallery extends ImageProfile(750, 480, 90) {}

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

