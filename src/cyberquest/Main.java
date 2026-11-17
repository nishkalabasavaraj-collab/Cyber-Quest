package cyberquest;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.security.SecureRandom;

/** Starts a tiny local web server using only classes included in the JDK. */
public class Main {
    private static final int PORT = 8080;
    private final PlayerService players;
    private final Path webFolder = Path.of("web").toAbsolutePath().normalize();

    private Main(PlayerService players) { this.players = players; }

    public static void main(String[] args) throws Exception {
        FileStorage storage = new FileStorage();
        PlayerService players = new PlayerService(storage);
        ProgressSaver saver = new ProgressSaver(players);
        Thread saverThread = new Thread(saver, "cyberquest-progress-saver");
        saverThread.setDaemon(true);
        saverThread.start();

        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", PORT), 0);
        Main app = new Main(players);
        server.createContext("/api/", app::handleApi);
        server.createContext("/", app::serveWebFile);
        server.start();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            saver.stop();
            saverThread.interrupt();
            try {
                players.save();
                saverThread.join(2_000);
            } catch (Exception e) {
                System.err.println("Could not finish saving: " + e.getMessage());
            }
            server.stop(0);
        }));
        System.out.println("CyberQuest is ready at http://localhost:" + PORT);
        System.out.println("Press Ctrl+C to stop the server.");
    }

    private void handleApi(HttpExchange exchange) throws IOException {
        try {
            Map<String, String> form = readForm(exchange);
            String path = exchange.getRequestURI().getPath();
            String response;
            switch (path) {
                case "/api/register" -> response = playerJson(players.register(form.get("username"), form.get("password")));
                case "/api/login" -> response = playerJson(players.login(form.get("username"), form.get("password")));
                case "/api/profile" -> {
                    Player player = players.find(form.get("id"));
                    if (player == null) throw new IllegalArgumentException("Player not found. Please log in.");
                    response = playerJson(player);
                }
                case "/api/score" -> {
                    int correct = Integer.parseInt(form.getOrDefault("correct", "0"));
                    int total = Integer.parseInt(form.getOrDefault("total", "0"));
                    players.record(form.get("id"), form.get("type"), correct, total);
                    response = playerJson(players.find(form.get("id")));
                }
                case "/api/leaderboard" -> response = leaderboardJson(players.leaderboard());
                case "/api/generate" -> response = generatePasswordJson();
                default -> throw new IllegalArgumentException("Unknown request.");
            }
            send(exchange, 200, response);
        } catch (NumberFormatException e) {
            send(exchange, 400, "{\"error\":\"Please submit a valid score.\"}");
        } catch (IllegalArgumentException e) {
            send(exchange, 400, "{\"error\":" + quote(e.getMessage()) + "}");
        } catch (Exception e) {
            send(exchange, 500, "{\"error\":\"The request could not be saved. Please try again.\"}");
            System.err.println("Request error: " + e.getMessage());
        }
    }

    private Map<String, String> readForm(HttpExchange exchange) throws IOException {
        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        Map<String, String> values = new HashMap<>();
        for (String part : body.split("&")) {
            String[] pair = part.split("=", 2);
            String key = URLDecoder.decode(pair[0], StandardCharsets.UTF_8);
            String value = pair.length > 1 ? URLDecoder.decode(pair[1], StandardCharsets.UTF_8) : "";
            values.put(key, value);
        }
        return values;
    }

    private void serveWebFile(HttpExchange exchange) throws IOException {
        String requested = exchange.getRequestURI().getPath();
        if (requested.equals("/")) requested = "/index.html";
        Path file = webFolder.resolve(requested.substring(1)).normalize();
        if (!file.startsWith(webFolder) || Files.notExists(file) || Files.isDirectory(file)) {
            send(exchange, 404, "Page not found.");
            return;
        }
        String name = file.getFileName().toString();
        String type = name.endsWith(".css") ? "text/css; charset=utf-8"
                : name.endsWith(".js") ? "text/javascript; charset=utf-8" : "text/html; charset=utf-8";
        byte[] content = Files.readAllBytes(file);
        exchange.getResponseHeaders().set("Content-Type", type);
        exchange.sendResponseHeaders(200, content.length);
        exchange.getResponseBody().write(content);
        exchange.close();
    }

    private String playerJson(Player p) {
        return "{\"id\":" + quote(p.getId()) + ",\"username\":" + quote(p.getUsername())
                + ",\"points\":" + p.getPoints() + ",\"challenges\":" + p.getChallenges()
                + ",\"correct\":" + p.getCorrect() + ",\"attempted\":" + p.getAttempted()
                + ",\"level\":" + quote(p.getLevel()) + "}";
    }

    private String leaderboardJson(List<Player> list) {
        StringBuilder json = new StringBuilder("[");
        int count = Math.min(10, list.size());
        for (int i = 0; i < count; i++) {
            if (i > 0) json.append(',');
            json.append(playerJson(list.get(i)));
        }
        return json.append(']').toString();
    }

    private String generatePasswordJson() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 16; i++) password.append(chars.charAt(random.nextInt(chars.length())));
        return "{\"password\":" + quote(password.toString()) + "}";
    }

    private String quote(String value) {
        if (value == null) return "\"\"";
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r") + "\"";
    }

    private void send(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }
}
