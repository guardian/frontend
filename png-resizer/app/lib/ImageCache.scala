package lib

import common.Logging
import conf.Configuration
import services.S3ByteStore

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

object ImageCache extends Logging {

  lazy val version = {
    val v = "v1"
    log.info(s"Using imageresizer version path $v")
    v
  }

  lazy val store = Configuration.aws.credentials.map { credentials =>
    new S3ByteStore(Configuration.pngResizer.bucket, credentials)
  }

  def getImage(path: String, meta: String): Future[Option[Array[Byte]]] = {
    store.map { _.get(s"$version/$meta/$path") }.getOrElse(Future.successful(None))
  }
  def putImage(path: String, meta: String, data: Array[Byte]): Future[Unit] = {
    store.map { store =>
      store.putPrivate(s"$version/$meta/$path", data, "image/png").map(_ => ())
      // do we care if it fails?
    }.getOrElse(Future.successful(()))
  }

}
