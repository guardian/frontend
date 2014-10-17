package util

import org.json4s.JsonAST.JObject

object Json4s {
  implicit class RichJObject(a: JObject) {
    /** I really thought this method would exist in Json4s but I couldn't find it */
    def update(b: JObject) = {
      val bKeys = b.obj.map(_._1).toSet

      JObject(a.obj.filterNot(item => bKeys.contains(item._1)) ++ b.obj)
    }
  }
}
