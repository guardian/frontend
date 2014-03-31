package performance

import play.api.mvc._
import scala.concurrent.Future
import common.{ManifestData, Edition, ExecutionContexts}
import shade.memcached.{Configuration => MemcachedConf, Codec, Memcached}
import play.api.libs.iteratee.{Enumerator, Iteratee}
import scala.concurrent.duration._
import org.apache.commons.codec.digest.DigestUtils
import DigestUtils.sha256Hex
import conf.Switches.{MemcachedSwitch, IncludeBuildNumberInMemcachedKey}
import common.MemcachedMetrics._
import play.api.mvc.SimpleResult
import play.api.mvc.ResponseHeader
import org.joda.time.{Seconds, DateTime}
import play.api.Play
import Play.current
import conf.Configuration


case class CachedResponse(result: SimpleResult, body: String)

private[performance] trait MemcachedSupport extends ExecutionContexts with implicits.Dates {
  import play.api.libs.json._

  private val CacheTime = """.*max-age=(\d+).*""".r

  lazy val isConfigured = Configuration.memcached.host.isDefined
  lazy val host = Configuration.memcached.host.head
  lazy val memcached = Memcached(MemcachedConf(host), actorSystem.scheduler, memcachedExecutionContext)

  implicit object ResultCodec extends Codec[CachedResponse] {

    override def deserialize(data: Array[Byte]): CachedResponse = {
      val json = Json.parse(data)
      val headerJson = (json \ "header" \ "headers").as[JsObject]
      val status = (json \ "header" \ "status").as[Int]
      val headers = headerJson.keys.map(key => key -> (headerJson \ key).as[String]).toMap
      val body = (json \ "body").as[String]

      val timeCached = (json \ "cachedAt").as[String].parseHttpDateTimeString

      val secondsAgo = Seconds.secondsBetween(timeCached, DateTime.now).getSeconds

      val originalCacheTime = headers.get("Cache-Control").flatMap{
        case CacheTime(seconds) => Some(seconds.toInt)
        case _ => None
      }

      val newHeaders = originalCacheTime.map{ t =>
        headers + ("Cache-Control" -> headers("Cache-Control").replaceAll("""max-age=\d+""", s"max-age=${t - secondsAgo}"))
      }.getOrElse(headers)

      CachedResponse(SimpleResult(ResponseHeader(status, newHeaders), Enumerator(body.getBytes("utf-8")) ), body)
    }

    override def serialize(response: CachedResponse): Array[Byte] = {
      val header = response.result.header
      val s = JsObject(Seq(
        "header" -> JsObject(Seq(
          "status" -> JsNumber(header.status),
          "headers" -> JsObject(header.headers.toSeq.map{
            case (key, value) => key -> JsString(value)
          })
        )),
        "body" -> JsString(response.body),
        "cachedAt" -> JsString(DateTime.now.toHttpDateTimeString)
      ))
      Json.stringify(s).getBytes("utf-8")
    }
  }

  // this needs to return the body as otherwise it is read twice.
  // in that case I got some weird result in testing.
  def cache(key: String, result: SimpleResult): Future[String] = {
    val promiseOfBody = result.body |>>> Iteratee.consume[Array[Byte]]()
    promiseOfBody.map{ bodyArr =>
      val body = new String(bodyArr, "utf-8")
      result.header.status match {
        case 200 => result.header.headers.get("Cache-Control").foreach{
          case CacheTime(time) => memcached.set(key, CachedResponse(result, body), time.toInt.seconds)
          case _ =>
        }
        case _ =>
      }
      body
    }
  }
}

private object CacheKey extends implicits.Requests {
  def apply(r: RequestHeader): String = {
    val build = if (IncludeBuildNumberInMemcachedKey.isSwitchedOn) ManifestData.build else ""
    val upstreamCacheKey = r.headers.get("X-Gu-Cache-Key").getOrElse("")
    val edition = Edition(r).id
    sha256Hex(s"${r.host}${r.uri} $edition $upstreamCacheKey $build")
  }
}

object MemcachedAction extends Results with MemcachedSupport {

  def apply(block: RequestHeader => Future[SimpleResult]): Action[AnyContent] = Action.async { request =>

    // don't cache during tests
    if (isConfigured && MemcachedSwitch.isSwitchedOn && !Play.isTest) {
      val cacheKey = CacheKey(request)
      val promiseOfCachedResult = memcached.get[CachedResponse](cacheKey).map(_.map(_.result))

      promiseOfCachedResult.flatMap {
        case Some(cached) =>
          FilterCacheHit.increment()
          Future.successful(cached.withHeaders("X-Gu-NG-Cached" -> "HIT"))
        case _ =>
          FilterCacheMiss.increment()
          val uncached = block(request)
          uncached.flatMap(cache(cacheKey, _)).flatMap { body =>
            uncached.map(_.copy(body = Enumerator(body.getBytes("utf-8"))).withHeaders("X-Gu-NG-Cached" -> "MISS"))
          }
      }
    } else {
      block(request)
    }
  }
}
