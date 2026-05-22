import java.nio.file.Path
import scala.meta.{Defn, Input, Pkg, Source, Term, Tree}
import scala.meta.internal.semanticdb.{Locator, TextDocument}

case class Call(subject: String, owner: String, node: Tree)
case class CallHierarchyNode(node: Call, callers: Seq[CallHierarchyNode])

object Analysis {

  def findViewsCallSites(node: Tree): Seq[Term.Select] = {
    val allCallSites = node.collect {
      case s: Term.Select if s.qual.text.startsWith("views.html") => s
    }
    // dedupe to avoid selecting views.html.fragment as well as views.html.fragments.articleBody
    allCallSites
      // we identify unique call sites by their start position in the source code
      .groupBy { callSite =>
        val position = callSite.origin.position
        (position.startLine, position.startColumn)
      }
      // for all the call sites at a given start position
      // sorting by name length keeps the longest (most specific) at the end
      .flatMap(_._2.sortBy(_.name.value.length).lastOption)
      .toSeq

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

  def parseScalaFile(path: Path): Option[Source] = {
    val bytes = java.nio.file.Files.readAllBytes(path)
    val text = new String(bytes, "UTF-8")
    val input = Input.VirtualFile(path.toString, text)
    input.parse[Source].toOption
  }

  def loadSemanticDB(path: Path, filename: String): Option[TextDocument] = {
    var document: Option[TextDocument] = None
    Locator(path) { case (path, documents) =>
      if (path.getFileName.toString == filename) {
        documents.documents.headOption.foreach { doc =>
          document = Some(doc)
        }
      }
    }
    document
  }

  def findNextCallers(node: Tree, root: Tree, document: TextDocument): Seq[Call] = {
    identifyFullyQualifiedName(node).map(formatFullyQualifiedName) match {
      case Some(fullyQualifiedName) =>
        val callSites = document.occurrences.filter { symbol =>
          symbol.symbol == fullyQualifiedName && symbol.role.isReference
        }

        val positions = callSites.flatMap(_.range)
        val startLines = positions.map(_.startLine).toSet
        def matchesPosition(node: Tree): Boolean = {
          positions.exists { pos =>
            node.pos.startLine == pos.startLine &&
            node.pos.startColumn == pos.startCharacter &&
            node.pos.endLine == pos.endLine &&
            node.pos.endColumn == pos.endCharacter
          }
        }
        root
          .collect {
            case node if startLines.contains(node.origin.position.startLine) && matchesPosition(node) => node
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

  def buildCallHierarchy(call: Call, root: Tree, document: TextDocument): CallHierarchyNode = {
    val callers = findNextCallers(call.node, root, document).map { caller =>
      buildCallHierarchy(caller, root, document)
    }
    CallHierarchyNode(call, callers)
  }

  def printCallHierarchy(node: CallHierarchyNode, indent: String = ""): Unit = {
    println(s"$indent${node.node.owner}")
    node.callers.foreach(caller => printCallHierarchy(caller, indent + "  "))
  }

  def main(args: Array[String]): Unit = {

    val scalaFilePath = java.nio.file.Paths.get("./article/app/controllers/ArticleController.scala")
    val source = parseScalaFile(scalaFilePath).get

    val semanticDBPath = Path.of("./article/target/scala-2.13/meta/META-INF/semanticdb/article/app/controllers")
    val document = loadSemanticDB(semanticDBPath, "ArticleController.scala.semanticdb").get

    val viewsCallSites = findViewsCallSites(source)
    val nextCallers = viewsCallSites.map { node =>
      val fullyQualifiedName = identifyFullyQualifiedName(node).map(formatFullyQualifiedName).getOrElse("unknown")
      val call = Call(node.name.value, fullyQualifiedName, node)
      buildCallHierarchy(call, source, document)
    }.distinct
    nextCallers.foreach(node => printCallHierarchy(node))
  }

}
