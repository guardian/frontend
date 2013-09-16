package model.image

import java.awt.image.BufferedImage
import org.im4java.core.{ IMOperation, ConvertCmd, Stream2BufferedImage }
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

case class Profile(width: Option[Int] = None, height: Option[Int] = None, compression: Int = 10) {}

// Configuration of our different image profiles
object Contributor extends Profile(Some(140), Some(140), 70) {}
object Gallery extends Profile(Some(750), Some(480), 90) {}
object GalleryLargeTrail extends Profile(Some(480), Some(288), 70) {}
object GallerySmallTrail extends Profile(Some(280), Some(168), 70) {}
object FeaturedTrail extends Profile(Some(640), None, 70) {}

// Just degrade the image quality without adjusting the width/height
object Naked extends Profile(None, None, 70) {}

object Im4Java {

  def apply(image: BufferedImage, operation:IMOperation, format: String = "jpg"): Array[Byte] = {

    val cmd = new ConvertCmd(true) // true uses GraphicsMagick, which is better supported by CentOS
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

