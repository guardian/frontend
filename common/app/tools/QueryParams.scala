package tools

import java.net.URLDecoder

object QueryParams {
  import scala.language.postfixOps
  def get(enc: String) : Map[String, Seq[String]] = {
    def decode(raw: String) = URLDecoder.decode(raw, "UTF-8")
    val params = enc.dropWhile('?'!=).dropWhile('?'==)
    val pairs: Seq[(String,String)] = params.split('&').flatMap {
      _.split('=') match {
        case Array(key, value) => List((decode(key), decode(value)))
        case Array(key) if key != "" => List((decode(key), ""))
        case _ => Nil
      }
    }
    pairs.groupBy(_._1).map(t => (t._1, t._2.map(_._2))).toMap.withDefault { _ => Nil }
  }
}
