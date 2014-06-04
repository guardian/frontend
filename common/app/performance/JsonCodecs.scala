package performance

import play.api.libs.json.{Json, Format}
import shade.memcached.Codec

object JsonCodecs {
  implicit def gzippedCodec[A: Format] = new Codec[A] {
    override def serialize(value: A): Array[Byte] = {
      Zip(Json.stringify(Json.toJson(value)).getBytes("utf-8"))
    }

    override def deserialize(data: Array[Byte]): A = {
      Json.parse(Unzip(data)).as[A]
    }
  }
}
