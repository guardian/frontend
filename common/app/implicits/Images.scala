package implicits

import java.io.{ ByteArrayOutputStream, InputStream }
import java.awt.image.BufferedImage
import javax.imageio.{ ImageWriter, IIOImage, ImageWriteParam, ImageIO }

trait Images extends Numbers with AutomaticResourceManagement {
  implicit def inputstream2ToBufferedImage(is: InputStream) = new {
    lazy val toBufferedImage: BufferedImage = withCloseable(is) { ImageIO read _ }
  }

  implicit def imageWriteParam2SetCompression(parameters: ImageWriteParam) = new {
    def setCompression(percent: Int) {
      val compression = (percent / 100.0).constrain(0, 1)
      parameters setCompressionMode ImageWriteParam.MODE_EXPLICIT
      parameters setCompressionQuality compression.toFloat
    }
  }

  implicit def imageWriter2Write(writer: ImageWriter) = new {
    def write(image: BufferedImage, parameters: ImageWriteParam) {
      writer.write(null, new IIOImage(image, null, null), parameters)
    }
  }

  implicit def image2Bytes(image: BufferedImage) = new {
    def apply(format: String) = new {
      def compress(percent: Int) = {
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
  }
}