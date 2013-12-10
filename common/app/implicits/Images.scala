package implicits

import java.io.{ ByteArrayOutputStream, InputStream }
import java.awt.image.BufferedImage
import javax.imageio.{ ImageWriter, IIOImage, ImageWriteParam, ImageIO }
import scala.language.reflectiveCalls

trait Images extends Numbers with AutomaticResourceManagement {

  implicit class Inputstream2ToBufferedImage(is: InputStream) {
    lazy val toBufferedImage: BufferedImage = withCloseable(is){ ImageIO read _ }
  }

  implicit class ImageWriteParam2SetCompression(parameters: ImageWriteParam) {
    def setCompression(percent: Int) {
      val compression = (percent / 100.0).constrain(0, 1)
      parameters setCompressionMode ImageWriteParam.MODE_EXPLICIT
      parameters setCompressionQuality compression.toFloat
    }
  }

  implicit class ImageWriter2Write(writer: ImageWriter) {
    def write(image: BufferedImage, parameters: ImageWriteParam) {
      writer.write(null, new IIOImage(image, null, null), parameters)
    }
  }

  case class BufferedImageWithFormat(image: BufferedImage, format: String) {
    def compressedTo(percent: Int): Array[Byte] = {
      withDisposable(ImageIO.getImageWritersByFormatName(format).next) { writer =>
        withCloseable(new ByteArrayOutputStream()) { baos =>
          val parameters = writer.getDefaultWriteParam
          parameters setCompression percent

          writer.setOutput(ImageIO.createImageOutputStream(baos))
          writer.write(image, parameters)

          baos.flush()
          baos.toByteArray
        }
      }
    }
  }

  implicit class Image2BufferedImageWithFormat(image: BufferedImage) {
    def formattedWith(format: String) = BufferedImageWithFormat(image, format)
  }
}
