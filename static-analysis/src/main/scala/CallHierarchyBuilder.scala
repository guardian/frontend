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

  private def findEnclosingConstruct(node: Tree): Option[Tree] = node.parent match {
    case Some(defn: Defn.Def)    => Some(defn)
    case Some(defn: Defn.Class)  => Some(defn)
    case Some(defn: Defn.Trait)  => Some(defn)
    case Some(defn: Defn.Object) => Some(defn)
    case Some(pkg: Pkg)          => Some(pkg)
    case Some(parentNode)        => findEnclosingConstruct(parentNode)
    case None                    => None
  }

  private def buildFullyQualifiedSymbolName(node: Tree, parents: List[Tree] = List.empty): List[Tree] =
    findEnclosingConstruct(
      node,
    ) match {
      case Some(owner) => buildFullyQualifiedSymbolName(owner, owner :: parents)
      case None        => parents
    }

  // Given a node in the AST, will resolve the fully qualified symbol name of the enclosing method
  private def resolveEnclosingSymbolName(node: Tree): SemanticDBSymbol = {
    val symbol = buildFullyQualifiedSymbolName(node).map {
      case defn: Defn.Def    => s"${defn.name.value}()."
      case defn: Defn.Class  => s"${defn.name.value}#"
      case defn: Defn.Trait  => s"${defn.name.value}#"
      case defn: Defn.Object => s"${defn.name.value}."
      case pkg: Pkg          => s"${pkg.name.value.replace(".", "/")}/"
      case other => throw new RuntimeException(s"Unexpected tree node type: ${other.getClass.getSimpleName}")
    }.mkString
    SemanticDBSymbol(symbol)
  }

  private def nextLevelCallers(method: MethodRef): Seq[MethodRef] = {
    val fullyQualifiedCallers =
      symbolOccurrenceToSourceTree(method.file, method.occurrence)
        // we don't care if a reference is just an import or a package declaration
        // we want usage within the logic
        .filterNot(isPackageOrImport)
        .map(resolveEnclosingSymbolName)

    fullyQualifiedCallers
      .flatMap(semanticDB.getOccurrences)
      .filter { case (_, occurrence) => occurrence.role.isReference }
      .map { case (file, occurrence) => MethodRef(SemanticDBSymbol(occurrence.symbol), occurrence, file) }
  }

  private def recursivelyBuildCallHierarchy(
      callee: MethodRef,
      visited: Set[SemanticDBSymbol] = Set.empty,
  ): CallHierarchy = {
    if (visited.contains(callee.symbolName)) {
      CallHierarchyCycle(callee)
    } else {
      val callers = nextLevelCallers(callee).map { case caller =>
        recursivelyBuildCallHierarchy(callee = caller, visited = visited + callee.symbolName)
      }
      if (callers.isEmpty) {
        CallHierarchyEntryPoint(callee)
      } else {
        CallHierarchyNode(callee, callers)
      }
    }
  }

  /** Given a method reference, build the call hierarchy tree for that method, recursively finding all callers up the
    * chain until reaching entry points (methods with no callers) or recursion (cycles).
    * @param callee
    *   the method reference to build the call hierarchy from
    * @return
    *   a call hierarchy tree
    */
  def buildCallHierarchy(
      callee: MethodRef,
  ): CallHierarchy = recursivelyBuildCallHierarchy(callee)

}
