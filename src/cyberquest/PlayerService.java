package cyberquest;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/** Registration, login, scoring, and leaderboard operations. */
public class PlayerService {
    private static final int HASH_ROUNDS = 65_536;
    private static final int HASH_BITS = 256;
    private final FileStorage storage;
    private final List<Player> players;

    public PlayerService(FileStorage storage) throws IOException {
        this.storage = storage;
        this.players = new ArrayList<>(storage.loadPlayers());
    }

    public synchronized Player register(String username, String password)
            throws Exception {
        String name = username == null ? "" : username.trim();
        if (!name.matches("[A-Za-z0-9_]{3,20}"))
            throw new IllegalArgumentException("Username must be 3–20 letters, digits, or underscores.");
        if (password == null || password.length() < 8)
            throw new IllegalArgumentException("Use a sample password with at least 8 characters.");
        for (Player player : players) {
            if (player.getUsername().equalsIgnoreCase(name))
                throw new IllegalArgumentException("That username is already registered.");
        }
        byte[] randomSalt = new byte[16];
        new SecureRandom().nextBytes(randomSalt);
        String salt = Base64.getEncoder().encodeToString(randomSalt);
        Player player = new Player(name, salt, hash(password, randomSalt));
        players.add(player);
        storage.savePlayers(players);
        return player;
    }

    public synchronized Player login(String username, String password) throws Exception {
        for (Player player : players) {
            if (player.getUsername().equalsIgnoreCase(username == null ? "" : username.trim())
                    && hash(password == null ? "" : password,
                    Base64.getDecoder().decode(player.getSalt())).equals(player.getPasswordHash())) {
                return player;
            }
        }
        throw new IllegalArgumentException("Username or password was not recognized.");
    }

    public synchronized Player find(String id) {
        for (Player player : players) if (player.getId().equals(id)) return player;
        return null;
    }

    public synchronized int record(String id, String type, int correct, int total) throws IOException {
        Player player = find(id);
        if (player == null) throw new IllegalArgumentException("Please log in again to save your score.");
        if (total < 0 || total > 100 || correct < 0 || correct > total)
            throw new IllegalArgumentException("The submitted score was not valid.");
        Challenge challenge = Challenge.create(type);
        int earned = challenge.calculateScore(correct, total);
        player.addResult(earned, correct, total);
        storage.savePlayers(players);
        return earned;
    }

    public synchronized List<Player> leaderboard() {
        List<Player> sorted = new ArrayList<>(players);
        sorted.sort((a, b) -> Integer.compare(b.getPoints(), a.getPoints()));
        return sorted;
    }

    public synchronized void save() throws IOException { storage.savePlayers(players); }

    private String hash(String password, byte[] salt) throws GeneralSecurityException {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, HASH_ROUNDS, HASH_BITS);
        try {
            byte[] bytes = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(bytes);
        } finally {
            spec.clearPassword();
        }
    }
}
