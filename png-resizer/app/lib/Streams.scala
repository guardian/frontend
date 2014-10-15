package lib

import java.io.InputStream
import java.awt.image.BufferedImage
import javax.imageio.ImageIO
import AutomaticResourceManagement._

object Streams {
  implicit class RichInputStream(inputStream: InputStream) {
    lazy val toBufferedImage: BufferedImage = withCloseable(inputStream)(ImageIO.read)
  }
}
