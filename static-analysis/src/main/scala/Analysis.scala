import java.nio.file.Path
import scala.meta.{Defn, Import, Importer, Input, Pkg, Position, Source, Term, Tree}
import scala.meta.internal.semanticdb.{Range, Locator, SymbolOccurrence, TextDocument}

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

  def findViewsCallSites(scalaSources: ScalaSources): Seq[Term.Select] = {
    val allCallSites = scalaSources.collect {
      case (file, s: Term.Select) if s.qual.text.startsWith("views.html") && !isPackageOrImport(s) => file -> s
    }
    // dedupe to avoid selecting views.html.fragment as well as views.html.fragments.articleBody
    val grouped = allCallSites
      // we identify unique call sites by their start position in the source code
      .groupBy { case (file, callSite) =>
        val position = callSite.origin.position
        (file, position.startLine, position.startColumn)
      }
    // for all the call sites at a given start position
    // sorting by name length keeps the longest (most specific) at the end
    grouped.flatMap { case (_, calls) =>
      val sortedCalls = calls.sortBy(_._2.name.value.length).lastOption.map(_._2)
      sortedCalls
    }.toSeq
  }
  def findViewsCallSites2(semanticDB: Map[String, TextDocument]): Seq[SymbolOccurrence] = {
    semanticDB.toSeq.flatMap { case (_, document) =>
      document.occurrences.filter { symbol =>
        symbol.symbol.startsWith("views/html/") && symbol.role.isReference
      }
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

  def identifyFullyQualifiedName(node: Tree, parents: List[Tree] = List.empty): Option[List[Tree]] = findOwner(
    node,
  ) match {
    case Some(owner) => identifyFullyQualifiedName(owner, owner :: parents)
    case None        => Some(parents)
  }

  def formatFullyQualifiedName(nodes: List[Tree]): String = nodes.map {
    case defn: Defn.Def    => s"#${defn.name.value}()."
    case defn: Defn.Class  => defn.name.value
    case defn: Defn.Trait  => defn.name.value
    case defn: Defn.Object => defn.name.value
    case pkg: Pkg          => s"${pkg.name.value.replace(".", "/")}/"
    case other             => other.toString()
  }.mkString

  def findNextCallers(node: Tree, scalaSources: ScalaSources, semanticDB: Map[String, TextDocument]): Seq[Call] = {
    identifyFullyQualifiedName(node).map(formatFullyQualifiedName) match {
      case Some(fullyQualifiedName) =>
        val callSites = semanticDB.toSeq.flatMap { case (file, document) =>
          document.occurrences
            .filter { symbol =>
              symbol.symbol == fullyQualifiedName && symbol.role.isReference
            }
            .map(occurrence => file -> occurrence)
        }

        val positions = callSites.collect { case (file, SymbolOccurrence(Some(range), _, _)) =>
          (file, range)
        }.toSet

        def toRange(position: Position): Range =
          Range(position.startLine, position.startColumn, position.endLine, position.endColumn)

        scalaSources
          .collect {
            case (file, node) if positions.contains(file -> toRange(node.origin.position)) => node
          }
          .map { callerNode =>
            val callerOwner = identifyFullyQualifiedName(callerNode)
              .map(formatFullyQualifiedName)
              .getOrElse("unknown")
            Call(fullyQualifiedName, callerOwner, callerNode)
          }
      case None => List.empty
    }
  }

  def buildCallHierarchy(
      call: Call,
      scalaSources: ScalaSources,
      semanticDB: Map[String, TextDocument],
  ): CallHierarchyNode = {
    val callers = findNextCallers(call.node, scalaSources, semanticDB).map { caller =>
      buildCallHierarchy(caller, scalaSources, semanticDB)
    }
    CallHierarchyNode(call, callers)
  }

  def main(args: Array[String]): Unit = {
    val sources = SourceLoader.loadSources(Path.of("./article"))
    val semanticDB = SourceLoader.loadSemanticDB(Path.of("./article"))

    val viewsCallSites = findViewsCallSites(sources)
    // val viewsCallSites = findViewsCallSites2(semanticDB)

    // TODO use matching the position to the source to match to the source and find parent

    val nextCallers = viewsCallSites.map { node =>
      val fullyQualifiedSubjectName = s"${node.qual.text}.${node.name.value}"
      println("Processing call site: " + fullyQualifiedSubjectName)
      val fullyQualifiedCallerName = identifyFullyQualifiedName(node).map(formatFullyQualifiedName).getOrElse("unknown")

      val call = Call(fullyQualifiedSubjectName, fullyQualifiedCallerName, node)
      buildCallHierarchy(call, sources, semanticDB)
    }.distinct
    nextCallers.foreach(node => CallHierarchy.printCallHierarchy(node))
  }

}
