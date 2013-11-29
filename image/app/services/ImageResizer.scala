package services

import conf.Switches._
import model._
import org.im4java.core.IMOperation
import views.support._
import javax.imageio.ImageIO
import org.apache.commons.io.{IOUtils, FilenameUtils}
import java.io.File
import play.api.libs.ws.{WS, Response}
import play.api.mvc._
import common.{ExecutionContexts, Logging}
import play.api.libs.iteratee.Enumerator
import scala.collection.JavaConversions._

object ImageResizer extends Logging with Results with controllers.Implicits with ExecutionContexts {

  def renderWebp(path: String, cacheTime: Int, profile: Profile)(response: Response): SimpleResult =  {
    response.status match {
      case 200 =>

        // Write the original file to temp
        val inputFile = File.createTempFile(FilenameUtils.getName(path),"")
        val outputFile = File.createTempFile(FilenameUtils.getBaseName(path),".webp")

        try {
          val image = response.getAHCResponse.getResponseBodyAsStream.toBufferedImage
          ImageIO.write(image, FilenameUtils.getExtension(path), inputFile)

          // Resize can handle a width, or a width and a height.
          val resizeOptions: Seq[String] = (profile.width, profile.height) match {
            case (Some(width:Int), Some(height:Int)) => Seq("-resize",width.toString, height.toString)
            case (Some(width:Int), None) => Seq("-resize", width.toString)
            case _ => Nil
          }

          val options = resizeOptions ++ Seq("-q", "60", "-quiet", inputFile.getAbsolutePath, "-o",outputFile.getAbsolutePath)
          val proc = scala.sys.process.Process("cwebp", options)

          log.info("Resize %s (webp) to (%s,%s) at 60 compression".format(path, profile.width, profile.height))

          if (proc.! > 0 || !outputFile.exists) {
            NotFound
          } else {
            val imageData = IOUtils.toByteArray(outputFile.toURI)
            addResponseHeaders(Cached(cacheTime) {
              Ok(imageData) as "image/webp"
            })
          }
        }
        finally {
          inputFile.delete
          outputFile.delete
        }
      case _ => NotFound
    }
  }

  def renderJpeg(path:String, cacheTime: Int, profile: Profile)(response: Response): SimpleResult = {
    response.status match {
      case 200 =>
        val contentType = response.contentType
        val image = response.getAHCResponse.getResponseBodyAsStream.toBufferedImage

        log.info("Resize %s (jpeg) to (%s,%s) at %s compression".format(path, profile.width, profile.height, profile.compression))

        // configuration
        val operation = new IMOperation()
        operation.addImage

        (profile.width, profile.height) match {
          case (Some(width), Some(height)) => operation.resize(width, height)
          case (Some(width), None) => operation.resize(width)
          case _ => Unit
        }

        operation.quality(profile.compression.toDouble)
        operation.addImage("jpeg:-")

        val resized = model.image.Im4Java(image, operation, "jpeg")

        addResponseHeaders(Cached(cacheTime) {
          Ok(resized) as "image/jpeg"
        })

      case _ => NotFound
    }
  }

  import conf.Configuration.images.resizeService
  def renderImageService(profile: Profile, path: String, request: RequestHeader) = {
      val url = s"$resizeService/${profile.prefix}/$path"
      WS.url(url).withHeaders("Accept" -> request.headers("Accept")).get().map{ r =>
        val headers = r.ahcResponse.getHeaders.entrySet().toSeq.map(header => header.getKey -> header.getValue.mkString(","))
        SimpleResult(
          header = ResponseHeader(r.status),
          body = Enumerator.fromStream(r.getAHCResponse.getResponseBodyAsStream)
        ).withHeaders(headers:_*)
      }
  }

  private def addResponseHeaders(result: SimpleResult): SimpleResult = {
    if (AddVaryAcceptHeader.isSwitchedOn || ServeWebPImagesSwitch.isSwitchedOn) {
      result.withHeaders("Vary" -> "Accept")
    } else {
      result
    }
  }
}
