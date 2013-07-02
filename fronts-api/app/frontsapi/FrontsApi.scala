package frontsapi

trait FrontsApi {
  def getList(listName: String): List[String]

  def add(listName: String, pivot: String, value: String, after: Option[Boolean] = None): Option[_]
  def add(listName: String, value: String) = addAtPosition(listName, 0, value)
  def addAtPosition(listName: String, position: Int, value: String): Option[_]

  def removeItem(listName: String, value: String): Option[_]
  def removeList(listName: String): Option[_]
}

class FrontsApiMap extends FrontsApi {
  val db: scala.collection.mutable.Map[String, List[String]] = scala.collection.mutable.Map[String, List[String]]()

  def getList(listName: String) = db.get(listName) getOrElse Nil

  def addAtPosition(listName: String, position: Int, value: String): Option[Boolean] = {
    db.get(listName) map { l =>
      db += (listName -> insertAtPosition(l, position, value))
      true
    } orElse {
      db += (listName -> List(value))
      Option(true)
    }
  }

  private def insertAtPosition(l: List[String], position: Int, value: String): List[String] = {
    val splitList = l splitAt position
    splitList._1 ++ List(value) ++ splitList._2
  }

  def add(listName: String, pivot: String, value: String, after: Option[Boolean]): Option[Int] = {
    db.get(listName).map { l =>
      val index = after match {
        case Some(true) => l.indexOf(pivot) + 1
        case _          => l.indexOf(pivot)
      }
      val newList = insertAtPosition(l, index, value)
      db += (listName -> newList)
      l.length
    } orElse {
      db += (listName -> List(value))
      Option(1)
    }
  }

  def removeItem(listName: String, value: String): Option[Long] = {
    db.get(listName).map { l =>
      val newList = l.filterNot(_ == value)
      db += (listName -> newList)
      newList.length
    }
  }

  def removeList(listName: String): Option[scala.collection.mutable.Map[String, List[String]]] = {
    Option(db -= listName)
  }

  def push(listName: String, value: String) = {
    db.get(listName).map { l =>
      db += (listName -> (l :+ value))
      Some(l.length)
    } getOrElse {
      db += (listName -> List(value))
      Some(1L)
    }
  }

}

object FrontsApi extends FrontsApiMap