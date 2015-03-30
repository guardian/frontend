package lib

import java.io.{ByteArrayOutputStream, InputStream}
import java.awt.image.BufferedImage
import javax.imageio.ImageIO
import AutomaticResourceManagement._
import play.api.libs.iteratee.{Iteratee, Enumerator}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

object Streams {
  implicit class RichInputStream(inputStream: InputStream) {
    lazy val toBufferedImage: BufferedImage = withCloseable(inputStream)(ImageIO.read)
  }

  implicit class RichEnumeratorOfBytes(enumerator: Enumerator[Array[Byte]]) {
    def toByteArray: Future[Array[Byte]] = {
      val outputStream = new ByteArrayOutputStream()

      (enumerator run Iteratee.foreach[Array[Byte]] { bytes =>
        outputStream.write(bytes)
      }) map { _ =>
        val result = outputStream.toByteArray
        outputStream.close()
        result
      }
    }
  }
}
