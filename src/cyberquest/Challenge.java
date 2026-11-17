package cyberquest;

/** Shared parent class for the small types of challenge in CyberQuest. */
public abstract class Challenge {
    private final String name;

    protected Challenge(String name) { this.name = name; }

    public String getName() { return name; }

    /** Each challenge decides its points from the number of correct answers. */
    public abstract int calculateScore(int correct, int total);

    public static Challenge create(String type) {
        return switch (type == null ? "" : type) {
            case "quiz" -> new QuizChallenge();
            case "phishing" -> new PhishingChallenge();
            case "scenario" -> new ScenarioChallenge();
            case "password" -> new PasswordChallenge();
            default -> throw new IllegalArgumentException("Unknown challenge type.");
        };
    }
}

class QuizChallenge extends Challenge {
    QuizChallenge() { super("Quiz Arena"); }
    @Override public int calculateScore(int correct, int total) { return correct * 10; }
}

class PhishingChallenge extends Challenge {
    PhishingChallenge() { super("Phishing Detective"); }
    @Override public int calculateScore(int correct, int total) { return correct * 10; }
}

class ScenarioChallenge extends Challenge {
    ScenarioChallenge() { super("Defender Scenarios"); }
    @Override public int calculateScore(int correct, int total) { return correct * 10; }
}

class PasswordChallenge extends Challenge {
    PasswordChallenge() { super("Password Lab"); }
    @Override public int calculateScore(int correct, int total) { return correct > 0 ? 20 : 10; }
}
