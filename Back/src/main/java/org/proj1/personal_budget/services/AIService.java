package org.proj1.personal_budget.services;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class AIService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private static final String API_KEY = "Bearer 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";
    public String analyzeExpensesFromFile(String filePath) throws Exception {
        String content = Files.readString(Path.of(filePath));
        String prompt = buildPrompt(content);

        String escapedPrompt = prompt
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n");

        String json = buildJson(escapedPrompt);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                .header("Authorization", API_KEY)
                .header("Content-Type", "application/json")
                .header("HTTP-Referer", "http://localhost")        // OBLIGATORIU
                .header("X-Title", "PersonalBudgetAI")             // OBLIGATORIU
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    private String buildPrompt(String fileContent) {
        return """
Am următorul raport de cheltuieli, în format text:

%s

Te rog analizează aceste cheltuieli și spune-mi ce tip de cheltuitor sunt.
Tipurile posibile sunt: Economul, Cheltuitorul, Evitatorul, Călugărul, Cheltuitor normal.

Răspunde doar în format JSON valid, fără text explicativ suplimentar. Structura dorită este exact aceasta, de json, unde tip este unul din tipurile mentionate mai sus, iar explicatie e doar o mica explicatie de ce este tipul respectiv:

{
  "TIP": "Cheltuitorul",
  "EXPLICATIE": "Are tendința să cheltuie pe lucruri neesențiale, dar nu excesiv. Ai cheltuit...putin/mult/moderat luna aceasta"
}

Nu adăuga niciun alt text în afară de acest JSON.
""".formatted(fileContent);

    }

    private String buildJson(String prompt) {
        return """
        {
          "model": "meta-llama/llama-3-8b-instruct",
          "messages": [
            {"role": "user", "content": "%s"}
          ],
          "temperature": 0.7
        }
        """.formatted(prompt);
    }
}