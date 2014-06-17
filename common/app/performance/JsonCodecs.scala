package performance

import play.api.libs.json.{Json, Format}
import shade.memcached.Codec
import org.xerial.snappy.Snappy

object JsonCodecs {
  implicit def gzippedCodec[A: Format] = new Codec[A] {
    override def serialize(value: A): Array[Byte] = {
      Zip(Json.stringify(Json.toJson(value)).getBytes("utf-8"))
    }

    override def deserialize(data: Array[Byte]): A = {
      Json.parse(Unzip(data)).as[A]
    }
  }

  implicit def snappyCodec[A: Format] = new Codec[A] {
    override def serialize(value: A): Array[Byte] = {
      Snappy.compress(Json.stringify(Json.toJson(value)).getBytes("utf-8"))
    }

    override def deserialize(data: Array[Byte]): A = {
      Json.parse(Snappy.uncompress(data)).as[A]
    }
  }

  implicit def nonGzippedCodec[A: Format] = new Codec[A] {
    override def serialize(value: A): Array[Byte] = {
      Json.stringify(Json.toJson(value)).getBytes("utf-8")
    }

    override def deserialize(data: Array[Byte]): A = {
      Json.parse(data).as[A]
    }
  }
}
