package model.image

import java.awt.image.BufferedImage
import org.im4java.core.{ IMOperation, Operation, ConvertCmd, Stream2BufferedImage }
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

case class Profile(width: Int = 50, height: Int = 50, compression: Int = 50) {
 
  // the default operation set for the image transform
  lazy val operation = { 
    val op = new IMOperation()
    op.addImage
    op.resize(width, height)
    op.quality(compression.toDouble)
    op
  }

}

// Configuration of our different image profiles
object Contributor extends Profile(140, 140, 70) {}
object Gallery extends Profile(750, 480, 90) {}

// Test profiles
object Naked extends Profile(750, 480, 90) {
  override lazy val operation = {
    val op = new IMOperation()
    op.addImage
    op
  }
}

object Flip extends Profile {
  override lazy val operation = {
    val op = new IMOperation()
    op.addImage
    op.rotate(180.0)
    op
  }
}

object Grey extends Profile {
  override lazy val operation = {
    val op = new IMOperation()
    op.addImage
    op.colorspace("gray")
    op
  }
}

object Crop extends Profile {
  override lazy val operation = {
    val op = new IMOperation()
    op.addImage
    op.crop(300, 200, 100, 200)
    op.contrast
    op.resize(150, 100)
    op
  }
}

object Transform {

  def apply(image: BufferedImage, operation: Operation, format: String = "jpg"): Array[Byte] = { 
    
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

