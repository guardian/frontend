import scala.meta.Tree

case class Call(subject: String, owner: String, node: Tree)
case class CallHierarchyNode(node: Call, callers: Seq[CallHierarchyNode])

object CallHierarchy {
  def printCallHierarchy(node: CallHierarchyNode, indent: String = ""): Unit = {
    if (indent.isEmpty) {
      println(s"${node.node.subject}")
    }
    println(s"  $indent${node.node.owner}")
    node.callers.foreach(caller => printCallHierarchy(caller, indent + "  "))
  }
}
