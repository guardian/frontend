import SourceLoader.SourceRef

import java.nio.file.Path
import scala.meta.{Defn, Import, Importer, Input, Pkg, Position, Source, Term, Tree}
import scala.meta.internal.semanticdb.{Locator, Range, SymbolInformation, SymbolOccurrence, TextDocument}

object Analysis {

  def isPackageOrImport(node: Tree): Boolean = node.parent match {
    case Some(_: Pkg)         => true
    case Some(_: Importer)    => true
    case Some(_: Defn.Def)    => false
    case Some(_: Defn.Class)  => false
    case Some(_: Defn.Trait)  => false
    case Some(_: Defn.Object) => false
    case Some(parent)         => isPackageOrImport(parent)
    case None                 => false
  }

  def findViewsDefinitions(semanticDB: SemanticDB): Seq[(SourceRef, SymbolInformation)] = {
    semanticDB.allDocuments.flatMap { case (file, document) =>
      document.symbols
        .filter { symbol =>
          symbol.symbol.startsWith("views/html/") && (symbol.kind.isMethod || symbol.kind.isObject)
        }
        .map(definitions => file -> definitions)
        .map { case (file, definition) =>

          file -> definition
        }
    }
  }

  def findViewsCallSites(semanticDB: SemanticDB): Seq[(SourceRef, SymbolOccurrence)] = {
    val allDefs = findViewsDefinitions(semanticDB)
    allDefs.flatMap { case (_, definition) =>
      semanticDB
        .getOccurrences(definition.symbol)
        .filter { case (_, occurrence) => occurrence.role.isReference }
        .map { case (callFile, occurrence) => callFile -> occurrence }
    }
  }

  def findOwner(node: Tree): Option[Tree] = node.parent match {
    case Some(defn: Defn.Def)    => Some(defn)
    case Some(defn: Defn.Class)  => Some(defn)
    case Some(defn: Defn.Trait)  => Some(defn)
    case Some(defn: Defn.Object) => Some(defn)
    case Some(pkg: Pkg)          => Some(pkg)
    case Some(parentNode)        => findOwner(parentNode)
    case None                    => None
  }

  def identifyFullyQualifiedNameOfOwner(node: Tree, parents: List[Tree] = List.empty): Option[List[Tree]] = findOwner(
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

  def symbolOccurrenceToSourceTree(
      callSites: Seq[(SourceRef, SymbolOccurrence)],
      scalaSources: ScalaSources,
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

  def findNextCallers(call: Call, scalaSources: ScalaSources, semanticDB: SemanticDB): Seq[Call] = {
    val callSites = semanticDB.allDocuments.flatMap { case (file, document) =>
      document.occurrences
        .filter { symbol =>
          symbol.symbol == call.owner && symbol.role.isReference
        }
        .map(occurrence => file -> occurrence)
    }

    symbolOccurrenceToSourceTree(callSites, scalaSources).map { callerNode =>
      val callerOwner = identifyFullyQualifiedNameOfOwner(callerNode)
        .map(formatFullyQualifiedName)
        .getOrElse("unknown")
      Call(call.owner, callerOwner, callerNode)
    }
  }

  def buildCallHierarchy(
      call: Call,
      scalaSources: ScalaSources,
      semanticDB: SemanticDB,
  ): CallHierarchyNode = {
    val callers = findNextCallers(call, scalaSources, semanticDB).map { caller =>
      buildCallHierarchy(caller, scalaSources, semanticDB)
    }
    CallHierarchyNode(call, callers)
  }

  def main(args: Array[String]): Unit = {
    val sources = SourceLoader.loadSources(Path.of("./article"))
    val semanticDB = SourceLoader.loadSemanticDB(Path.of("./article"))

    val viewsCallSites = findViewsCallSites(semanticDB)

    viewsCallSites.foreach { case (file, occurrence) =>
      val sourceTrees = symbolOccurrenceToSourceTree(Seq(file -> occurrence), sources).filterNot(isPackageOrImport)

      val nextCallers = sourceTrees.map { case node: Term.Name =>
        val fullyQualifiedCallerName =
          identifyFullyQualifiedNameOfOwner(node).map(formatFullyQualifiedName).getOrElse("unknown")

        val call = Call(occurrence.symbol, fullyQualifiedCallerName, node)
        buildCallHierarchy(call, sources, semanticDB)
      }.distinct
      nextCallers.foreach(node => CallHierarchy.printCallHierarchy(node))
    }
  }

}
