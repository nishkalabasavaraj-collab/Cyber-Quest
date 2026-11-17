package cyberquest;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/** Reads and writes player records as simple local text rows. */
public class FileStorage {
    private final Path file = Path.of("data", "players.txt");

    public FileStorage() throws IOException {
        Files.createDirectories(file.getParent());
        if (Files.notExists(file)) Files.createFile(file);
    }

    public synchronized List<Player> loadPlayers() throws IOException {
        List<Player> players = new ArrayList<>();
        try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
            String row;
            while ((row = reader.readLine()) != null) {
                try {
                    String[] c = row.split("\\t", -1);
                    if (c.length != 8) continue;
                    players.add(new Player(c[0], decode(c[1]), c[2], c[3],
                            Integer.parseInt(c[4]), Integer.parseInt(c[5]),
                            Integer.parseInt(c[6]), Integer.parseInt(c[7])));
                } catch (IllegalArgumentException ignored) {
                    // Skip a malformed row and continue loading other players.
                }
            }
        }
        return players;
    }

    public synchronized void savePlayers(List<Player> players) throws IOException {
        try (BufferedWriter writer = Files.newBufferedWriter(file, StandardCharsets.UTF_8)) {
            for (Player p : players) {
                writer.write(String.join("\t", p.getId(), encode(p.getUsername()), p.getSalt(),
                        p.getPasswordHash(), Integer.toString(p.getPoints()),
                        Integer.toString(p.getChallenges()), Integer.toString(p.getCorrect()),
                        Integer.toString(p.getAttempted())));
                writer.newLine();
            }
        }
    }

    private String encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String decode(String value) {
        return new String(Base64.getDecoder().decode(value), StandardCharsets.UTF_8);
    }
}
