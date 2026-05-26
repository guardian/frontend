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
      callSites: Seq[(SourceRef, SymbolOccurrence)],
  ): Seq[Tree] = {
    val positions = callSites.collect { case (file, SymbolOccurrence(Some(range), _, _)) =>
      (file, range)
    }.toSet

    def toRange(position: Position): Range =
      Range(position.startLine, position.startColumn, position.endLine, position.endColumn)

    scalaSources
      .collect {
        case (file, node) if positions.contains(file -> toRange(node.origin.position)) => node
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

  private def identifyFullyQualifiedNameOfOwner(node: Tree, parents: List[Tree] = List.empty): Option[List[Tree]] =
    findOwner(
      node,
    ) match {
      case Some(owner) => identifyFullyQualifiedNameOfOwner(owner, owner :: parents)
      case None        => Some(parents)
    }

  def formatFullyQualifiedName(nodes: List[Tree]): String = nodes.map {
    case defn: Defn.Def    => s"${defn.name.value}()."
    case defn: Defn.Class  => s"${defn.name.value}#"
    case defn: Defn.Trait  => s"${defn.name.value}#"
    case defn: Defn.Object => s"${defn.name.value}."
    case pkg: Pkg          => s"${pkg.name.value.replace(".", "/")}/"
    case other             => other.toString()
  }.mkString

  private def findNextCallers(method: MethodRef): Seq[MethodRef] = {
    val fullyQualifiedCallers =
      symbolOccurrenceToSourceTree(Seq(method.file -> method.occurrence))
        .filterNot(isPackageOrImport)
        .map { callerNode =>
          identifyFullyQualifiedNameOfOwner(callerNode)
            .map(formatFullyQualifiedName)
            .getOrElse("unknown")
        }
        .toSet

    semanticDB.allDocuments.flatMap { case (file, document) =>
      document.occurrences
        .filter { symbol =>
          fullyQualifiedCallers.contains(symbol.symbol) && symbol.role.isReference
        }
        .map(occurrence => MethodRef(occurrence.symbol, occurrence, file))
    }
  }

  def buildCallHierarchy(
      callee: MethodRef,
  ): CallHierarchyNode = {
    val callers = findNextCallers(callee).map { case caller =>
      buildCallHierarchy(callee = caller)
    }
    CallHierarchyNode(callee, callers)
  }

}
