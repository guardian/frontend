import scala.meta.internal.semanticdb.SymbolOccurrence

case class SemanticDBSymbol(symbolName: String) extends AnyVal {
  override def toString() = symbolName
}

case class SourceRef(file: String) extends AnyVal {
  override def toString() = file
}

case class MethodRef(symbolName: SemanticDBSymbol, occurrence: SymbolOccurrence, file: SourceRef)

sealed trait CallHierarchy
case class CallHierarchyNode(callee: MethodRef, callers: Seq[CallHierarchy]) extends CallHierarchy
case class CallHierarchyCycle(callee: MethodRef) extends CallHierarchy
case class CallHierarchyEntryPoint(callee: MethodRef) extends CallHierarchy

object CallHierarchy {
  def printCallHierarchy(node: CallHierarchy, indent: String = ""): Unit = {
    node match {
      case CallHierarchyCycle(callee) =>
        println(s"${indent}${callee.symbolName} (cycle detected)")
      case CallHierarchyEntryPoint(callee) =>
        println(s"${indent}${callee.symbolName}")
      case CallHierarchyNode(callee, callers) =>
        println(s"${indent}${callee.symbolName}")
        callers.foreach(caller => printCallHierarchy(caller, indent + "  "))
    }
  }
}
