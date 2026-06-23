
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApiTester {
    public static void main(String[] args) {
        try {
            // Fetch list first
            System.out.println("Fetching list...");
            String listUrl = "http://localhost:8080/api/articles?size=1";
            String listJson = fetch(listUrl);
            System.out.println("List Response: " + listJson);

            // Extract ID (naive string search to avoid deps)
            int idIndex = listJson.indexOf("\"id\":\"");
            if (idIndex != -1) {
                String id = listJson.substring(idIndex + 6, idIndex + 6 + 36);
                System.out.println("Found ID: " + id);
                
                // Fetch detail
                String detailUrl = "http://localhost:8080/api/articles/" + id;
                System.out.println("Fetching detail from: " + detailUrl);
                String detailJson = fetch(detailUrl);
                System.out.println("Detail Response: " + detailJson);
                
                // Write to file
                java.nio.file.Files.writeString(
                    java.nio.file.Path.of("api_debug_output.txt"), 
                    detailJson, 
                    java.nio.charset.StandardCharsets.UTF_8
                );
            } else {
                System.out.println("No ID found in list response");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String fetch(String urlString) throws Exception {
        URL url = new URL(urlString);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("GET");
        
        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuilder content = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            content.append(inputLine);
        }
        in.close();
        return content.toString();
    }
}
