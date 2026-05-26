import SourceLoader.SourceRef

import scala.meta.{Defn, Importer, Pkg, Position, Tree}
import scala.meta.internal.semanticdb.{Range, SymbolOccurrence}

class CallHierarchyBuilder(
    scalaSources: ScalaSources,
    semanticDB: SemanticDB,
) {

  private def isPackageOrImport(node: Tree): Boolean = node.parent match {
    case Some(_: Pkg)         => true
    case Some(_: Importer)    => true
    case Some(_: Defn.Def)    => false
    case Some(_: Defn.Class)  => false
    case Some(_: Defn.Trait)  => false
    case Some(_: Defn.Object) => false
    case Some(parent)         => isPackageOrImport(parent)
    case None                 => false
  }

  private def symbolOccurrenceToSourceTree(
      file: SourceRef,
      symbolOccurrence: SymbolOccurrence,
  ): Seq[Tree] = {
    def toRange(position: Position): Range =
      Range(position.startLine, position.startColumn, position.endLine, position.endColumn)

    def sameCoordinates(sourceFile: SourceRef, position: Position): Boolean =
      sourceFile == file && symbolOccurrence.range.contains(toRange(position))

    scalaSources
      .collect {
        case (sourceFile, node) if sameCoordinates(sourceFile, node.origin.position) => node
      }
  }

  private def findOwner(node: Tree): Option[Tree] = node.parent match {
    case Some(defn: Defn.Def)    => Some(defn)
    case Some(defn: Defn.Class)  => Some(defn)
    case Some(defn: Defn.Trait)  => Some(defn)
    case Some(defn: Defn.Object) => Some(defn)
    case Some(pkg: Pkg)          => Some(pkg)
    case Some(parentNode)        => findOwner(parentNode)
    case None                    => None
  }

  private def identifyFullyQualifiedNameOfOwner(node: Tree, parents: List[Tree] = List.empty): List[Tree] =
    findOwner(
      node,
    ) match {
      case Some(owner) => identifyFullyQualifiedNameOfOwner(owner, owner :: parents)
      case None        => parents
    }

  def formatFullyQualifiedName(nodes: List[Tree]): String = nodes.map {
    case defn: Defn.Def    => s"${defn.name.value}()."
    case defn: Defn.Class  => s"${defn.name.value}#"
    case defn: Defn.Trait  => s"${defn.name.value}#"
    case defn: Defn.Object => s"${defn.name.value}."
    case pkg: Pkg          => s"${pkg.name.value.replace(".", "/")}/"
    case other             => throw new RuntimeException(s"Unexpected tree node type: ${other.getClass.getSimpleName}")
  }.mkString

  private def nextLevelCallers(method: MethodRef): Seq[MethodRef] = {
    val fullyQualifiedCallers =
      symbolOccurrenceToSourceTree(method.file, method.occurrence)
        .filterNot(isPackageOrImport)
        .map { callerNode =>
          formatFullyQualifiedName(identifyFullyQualifiedNameOfOwner(callerNode))
        }

    fullyQualifiedCallers
      .flatMap(semanticDB.getOccurrences)
      .filter { case (_, occurrence) => occurrence.role.isReference }
      .map { case (file, occurrence) => MethodRef(occurrence.symbol, occurrence, file) }
  }

  def buildCallHierarchy(
      callee: MethodRef,
      visited: Set[String] = Set.empty,
  ): CallHierarchy = {
    if (visited.contains(callee.symbolName)) {
      CallHierarchyCycle(callee)
    } else {
      val callers = nextLevelCallers(callee).map { case caller =>
        buildCallHierarchy(callee = caller, visited = visited + callee.symbolName)
      }
      if (callers.isEmpty) {
        CallHierarchyEntryPoint(callee)
      } else {
        CallHierarchyNode(callee, callers)
      }
    }
  }

}
