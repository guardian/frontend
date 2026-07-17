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
    private final Path path;

    public SimpleLogger(Path path) {
        // Resolve to an absolute, normalised path up front so directory creation and every write target
        // the exact same location, independent of the process working directory at any later moment
        // (and so the `..` in `../logs` is collapsed rather than left for File#mkdirs, which handles it
        // unreliably). On EC2 this is /home/<app>/logs; on a dev/staged run it sits next to the app.
        this.path = path.toAbsolutePath().normalize();

        try {
            // createDirectories reliably creates the whole chain and throws on failure, unlike
            // File#mkdirs which silently returns false (which we were ignoring).
            Files.createDirectories(this.path.getParent());
        } catch (IOException e) {
            System.err.println(
                "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Could not create Twirl usage log directory\",\"path\":\""
                    + this.path.getParent() + "\"}");
            e.printStackTrace();
        }

        // Print the resolved absolute path once, at construction (which is the first render), so it is
        // obvious where the log is being written.
        System.out.println(
            "{\"marker\":\"TEMPLATE_TRACKER_INIT\",\"message\":\"Twirl usage log location\",\"path\":\""
                + this.path + "\"}");
    }

    public synchronized void log(String json) throws IOException {
        // SYNC guarantees the file content and metadata are successfully written to disk.
        Files.writeString(this.path, json + System.lineSeparator(),
            StandardOpenOption.CREATE,
            StandardOpenOption.APPEND,
            StandardOpenOption.SYNC);
    }
}
