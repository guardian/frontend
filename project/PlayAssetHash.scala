package com.gu

import org.apache.commons.io.FileUtils
import sbt._
import sbt.Keys._
import sbtassembly.Plugin.AssemblyKeys._
import PlayArtifact._

object PlayAssetHash extends Plugin {

  val cleanAssetMaps = TaskKey[Unit]("clean-asset-maps", "Deletes all asset map files")

  val cleanAssetMapsTask = cleanAssetMaps <<= deleteAssetMaps

  lazy val staticFilesPackage: SettingKey[String] =
    SettingKey("static-files-package", "Package to deploy static files to when building artifact")

  staticFilesPackage := "static-files"

  lazy val playAssetHashCompileSettings: Seq[Setting[_]] = Seq(
    cleanAssetMapsTask,
    resourceGenerators in Compile <+= resourceGeneratorTask,
    managedResources in Compile <<= managedResourcesWithMD5s
  )

  lazy val playAssetHashDistSettings: Seq[Setting[_]] = playArtifactDistSettings ++ playAssetHashCompileSettings ++ Seq(
    playArtifactResources <++= assetMapResources,
    assetRoots <<= (sourceDirectory in Compile) { sourceDirectory =>
      Seq(
        (sourceDirectory / "assets"),
        (sourceDirectory / "public")
      )
    },
    assetsToHash <<= (sourceDirectory in Compile) { sourceDirectory =>
      Seq(
        (sourceDirectory / "assets" / "stylesheets") ** "*.css",
        (sourceDirectory / "assets" / "images") ** "*",
        (sourceDirectory / "public") ** "*"
      )
    }
  )

  lazy val assetRoots: SettingKey[Seq[File]] =
    SettingKey("asset-roots", "Root directories of assets")

  lazy val assetsToHash: SettingKey[Seq[PathFinder]] =
    SettingKey("assets-to-hash", "Extra assets to be hashed")

  val resourceGeneratorTask = (sourceDirectory in Compile, resourceManaged in Compile, assetsToHash, assetRoots) map {
    (sourceDirectory, resourceManaged, files, roots) => {
      files.flatMap{ generatorTransform(sourceDirectory, resourceManaged, _, roots) }
    }
  }

  def deleteAssetMaps = (streams, resourceManaged, target, assemblyDirectory in assembly, name) map {
    (s, resources, target, assemblyDirectory, name) =>
        val log = s.log
        val assetMapDir = target / "dist" / "assetmaps"
        if (assetMapDir.exists()) {
          FileUtils.deleteDirectory(assetMapDir)
          log.info("Deleted assetmap dir " + assetMapDir)
        }

        println("Delete cached *_dir files and folders from: %s. Cache may contain invalid hash maps".format(name))
        IO.delete((assemblyDirectory * "*dir").get)
  }

  def generatorTransform(sourceDirectory: File, resourceManaged: File, assetFinder: PathFinder, assetRoots: Seq[File]) = {
    val copies = assetFinder.get.filterNot(_.isDirectory) map {
      asset => {
        val root = assetRoots.find(asset.isRebaseableTo).getOrElse(
          sys.error("file " + asset + " does not fall under one of the roots " + assetRoots)
        )
        (asset, resourceManaged / "public" / asset.rebase(root).toString)
      }
    }
    IO.copy(copies)
    copies.unzip._2
  }

  private def managedResourcesWithMD5s = (streams in Compile, managedResources in Compile, resourceManaged in Compile) map {
    (streams, current, resourceManaged) =>
      implicit val log = streams.log

      val assetFiles = current filter { _.isUnder(resourceManaged / "public") }

      val assets = Assets.fromFiles(resourceManaged / "public", assetFiles)

      val assetRemappings = assets.toMD5Remap

      // Generate assetmap file
      val assetMapContents = assets.toText
      val assetMapFile = resourceManaged / "assetmaps" / ("asset.%s.map" format assetMapContents.md5Hex)

      IO.delete(resourceManaged / "assetmaps")
      IO.write(assetMapFile, assetMapContents)
      log.debug("Generated assetmap file at %s:\n%s".format(assetMapFile, assetMapContents).indentContinuationLines)

      // Copy assets to include md5Hex chunk. Moving would break subsequent calls.
      IO.copy(assetRemappings)
      log.debug(
        ("Renamed assets to include md5Hex chunk:\n" + (assetRemappings mkString "\n").sortLines).
          indentContinuationLines.
          deleteAll(resourceManaged / "public" + "/")
      )

      // Update current with new names and assetmap file
      assetMapFile +: (current updateWith assetRemappings).toSeq
  }

  private def assetMapResources = (assembly, target, staticFilesPackage) map {
    (assembly, target, staticDir) =>
      val targetDist = target / "dist"
      if (targetDist.exists()) {
        targetDist.delete()
      }

      // Extract and identify assets
      IO.unzip(assembly, targetDist, new SimpleFilter(name =>
        name.startsWith("assetmaps") || name.startsWith("public"))
      )

      val assetMaps = (targetDist / "assetmaps" * "*").get map { loadProperties(_) }

      // You determine a precedence order here if you like...
      val keyCollisions = assetMaps.toList.duplicateKeys
      if (!keyCollisions.isEmpty) {
        throw new RuntimeException("Assetmap collisions for: " + keyCollisions.toList.sorted.mkString(", "))
      }

      val staticFiles = assetMaps flatMap { _.values } map { file =>
        (targetDist / "public" / file, "packages/%s/%s".format(staticDir, file))
      }

      staticFiles
  }
}