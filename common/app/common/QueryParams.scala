package common

object QueryParams extends implicits.Strings {
  def get(enc: String) : Map[String, Seq[String]] = {
    val params = enc.dropWhile(_!='?').dropWhile(_=='?')
    val pairs: Seq[(String,String)] = params.split('&').flatMap {
      _.split('=') match {
        case Array(key, value) => List((key.stringDecoded, value.stringDecoded))
        case Array(key) if key != "" => List((key.stringDecoded, ""))
        case _ => Nil
      }
    }
    pairs.groupBy(_._1).map(t => (t._1, t._2.map(_._2))).toMap.withDefault { _ => Nil }
  }
}
