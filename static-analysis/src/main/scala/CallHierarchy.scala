import scala.meta.internal.semanticdb.SymbolOccurrence

case class SemanticDBSymbol(symbolName: String) extends AnyVal {
  override def toString() = symbolName
}

case class SourceRef(file: String) extends AnyVal {
  override def toString() = file
}

case class SymbolCoordinates(
    file: SourceRef,
    startLine: Int,
    startCharacter: Int,
    endLine: Int,
    endCharacter: Int,
)

case class MethodRef(symbolName: SemanticDBSymbol, occurrence: SymbolOccurrence, file: SourceRef)

sealed trait CallHierarchy {
  def callee: MethodRef
}

case class CallHierarchyNode(callee: MethodRef, callers: Seq[CallHierarchy]) extends CallHierarchy
case class CallHierarchyCycle(callee: MethodRef) extends CallHierarchy
case class CallHierarchyEntryPoint(callee: MethodRef) extends CallHierarchy

object CallHierarchy {
  def printCallHierarchy(node: CallHierarchy, indent: String = ""): Unit = {
    def formatMethodRef(methodRef: MethodRef): String = {
      s"${methodRef.symbolName} in ${methodRef.file}:${methodRef.occurrence.range.map(r => s"${r.startLine}:${r.startCharacter}").getOrElse("unknown")}"
    }
    node match {
      case CallHierarchyCycle(callee) =>
        println(s"${indent}${formatMethodRef(callee)} (cycle detected)")
      case CallHierarchyEntryPoint(callee) =>
        println(s"${indent}${formatMethodRef(callee)}")
        println(s"${indent}  No call to ${callee.symbolName} found (entry point)")
      case CallHierarchyNode(callee, callers) =>
        println(s"${indent}${formatMethodRef(callee)}")
        callers.foreach(caller => printCallHierarchy(caller, indent + "  "))
    }
  }
}
