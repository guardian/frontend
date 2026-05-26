import SourceLoader.SourceRef

import scala.meta.internal.semanticdb.SymbolOccurrence

case class MethodRef(qualifiedName: String, occurrence: SymbolOccurrence, file: SourceRef)
case class CallHierarchyNode(callee: MethodRef, callers: Seq[CallHierarchyNode])

object CallHierarchy {
  def printCallHierarchy(node: CallHierarchyNode, indent: String = ""): Unit = {
    println(s"${indent}${node.callee.qualifiedName}")
    node.callers.foreach(caller => printCallHierarchy(caller, indent + "  "))
  }
}
