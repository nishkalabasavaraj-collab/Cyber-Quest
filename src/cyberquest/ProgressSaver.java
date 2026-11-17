package cyberquest;

import java.io.IOException;

/** Periodically saves records in a background thread; interrupt stops it cleanly. */
public class ProgressSaver implements Runnable {
    private final PlayerService players;
    private volatile boolean running = true;

    public ProgressSaver(PlayerService players) { this.players = players; }

    @Override
    public void run() {
        while (running) {
            try {
                Thread.sleep(30_000);
                if (running) players.save();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (IOException e) {
                System.err.println("Background save failed: " + e.getMessage());
            }
        }
    }

    public void stop() { running = false; }
}
