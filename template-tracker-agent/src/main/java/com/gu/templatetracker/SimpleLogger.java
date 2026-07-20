package com.gu.templatetracker;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

/**
 * Inefficient but hopefully simple logger
 * We don't expect a crazy volume of log so this might just about do it.
 */
public class SimpleLogger {
    Path path;

    public SimpleLogger(Path path) {
        this.path = path;

        this.path.getParent().toFile().mkdirs();
    }

    public synchronized void log(String json) throws IOException {
        // SYNC guarantees the file content and metadata are successfully written to disk.
        Files.writeString(this.path, json + System.lineSeparator(),
            StandardOpenOption.CREATE,
            StandardOpenOption.APPEND,
            StandardOpenOption.SYNC);
    }
}
