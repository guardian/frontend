package controllers

import common.{ ExecutionContexts, Logging }
import conf.Switches._
import model._
import org.im4java.core.IMOperation
import play.api.http.MediaRange
import play.api.libs.ws.WS
import play.api.mvc._
import scala.concurrent.Future
import views.support._
import javax.imageio.ImageIO
import org.apache.commons.io.{IOUtils, FilenameUtils}
import java.io.File
import play.api.libs.ws.Response
import play.api.mvc.SimpleResult

object ImageController extends Controller with Logging with Implicits with ExecutionContexts {

  // URL validation: We're only going to accept proxy paths that match...
  val Path = """([/\w\.@~-]*)""".r

  def render(target: String, profile: String): Action[AnyContent] = {
    val dimensions = Profile.all find { _.prefix == profile }
    val image = dimensions map { renderImage(target, _) }

    image.getOrElse(Action(NotFound))
  }

  def renderImage(target: String, profile: Profile) = Action.async { implicit request =>
    val Path(sanitised) = target
    val path = "http://static.guim.co.uk/" + sanitised
    val imageCacheLifetime = 86400

    // Find the highest priority accept type
    val requestedContentType = request.acceptedTypes.sorted(MediaRange.ordering)
    val imageMimeType = requestedContentType.find(media => media.accepts("image/jpeg")|| media.accepts("image/webp"))
    val wsRequest: Future[Response]  = WS.url(path).get()

    imageMimeType match {
      case Some(media) if (media.mediaSubType == "webp" && ServeWebPImagesSwitch.isSwitchedOn) =>
                                                        wsRequest.map{renderWebp(path, imageCacheLifetime, profile)}
      case _ => wsRequest.map{renderJpeg(path, imageCacheLifetime, profile)}
    }
  }

  private def renderWebp(path: String, cacheTime: Int, profile: Profile)(response: Response): SimpleResult =  {
    response.status match {
      case 200 =>

        // Write the original file to temp
        val image = response.getAHCResponse.getResponseBodyAsStream.toBufferedImage
        val inputFile = new File(FilenameUtils.concat("/tmp/",FilenameUtils.getName(path)))
        ImageIO.write(image, FilenameUtils.getExtension(path), inputFile)

        val outputFile = new File(FilenameUtils.concat("/tmp/",FilenameUtils.getBaseName(path)+".webp"))

        // Resize can handle a width, or a width and a height.
        val resizeOptions: Seq[String] = (profile.width, profile.height) match {
          case (Some(width:Int), Some(height:Int)) => Seq("-resize",width.toString, height.toString)
          case (Some(width:Int), None) => Seq("-resize", width.toString)
          case _ => Nil
        }

        val proc = scala.sys.process.Process("cwebp", resizeOptions ++
                                                      Seq("-q", "60",
                                                          "-quiet",
                                                          inputFile.getAbsolutePath,
                                                          "-o",outputFile.getAbsolutePath))

        log.info("Resize %s (webp) to (%s,%s) at 60 compression".format(path, profile.width, profile.height))

        if (proc.! > 0 || !outputFile.exists)
        {
          NotFound
        }
        else
        {
          val imageData = IOUtils.toByteArray(outputFile.toURI)
          addResponseHeaders(Cached(cacheTime) {
            Ok(imageData) as "image/webp"
          })
        }
      case _ => NotFound
    }
  }

  private def renderJpeg(path:String, cacheTime: Int, profile: Profile)(response: Response): SimpleResult =  {
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
        operation.addImage("jpeg:-") // TODO assumes im and content-type will always map to each other

        val resized = model.image.Im4Java(image, operation, "jpeg")

        addResponseHeaders(Cached(cacheTime) {
          Ok(resized) as "image/jpeg"
        })

      case _ => NotFound
    }
  }

  private def addResponseHeaders(result: SimpleResult): SimpleResult = {
    if (AddVaryAcceptHeader.isSwitchedOn || ServeWebPImagesSwitch.isSwitchedOn)
    {
      result.withHeaders("Vary" -> "Accept")
    }
    else
    {
      result
    }
  }
}
