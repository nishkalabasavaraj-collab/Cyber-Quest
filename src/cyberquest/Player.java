package cyberquest;

import java.util.UUID;

/** A registered player and their simple game statistics. */
public class Player {
    private final String id;
    private final String username;
    private final String salt;
    private final String passwordHash;
    private int points;
    private int challenges;
    private int correct;
    private int attempted;

    public Player(String username, String salt, String passwordHash) {
        this(UUID.randomUUID().toString(), username, salt, passwordHash, 0, 0, 0, 0);
    }

    public Player(String id, String username, String salt, String passwordHash,
                  int points, int challenges, int correct, int attempted) {
        this.id = id;
        this.username = username;
        this.salt = salt;
        this.passwordHash = passwordHash;
        this.points = points;
        this.challenges = challenges;
        this.correct = correct;
        this.attempted = attempted;
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getSalt() { return salt; }
    public String getPasswordHash() { return passwordHash; }
    public synchronized int getPoints() { return points; }
    public synchronized int getChallenges() { return challenges; }
    public synchronized int getCorrect() { return correct; }
    public synchronized int getAttempted() { return attempted; }

    public synchronized void addResult(int earned, int right, int total) {
        points += Math.max(0, earned);
        challenges++;
        correct += Math.max(0, right);
        attempted += Math.max(0, total);
    }

    public String getLevel() {
        int score = getPoints();
        if (score >= 500) return "Cyber Guardian";
        if (score >= 300) return "Threat Analyst";
        if (score >= 180) return "Cyber Defender";
        if (score >= 80) return "Security Explorer";
        return "Cyber Beginner";
    }
}
