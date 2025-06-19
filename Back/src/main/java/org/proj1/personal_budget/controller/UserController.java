package org.proj1.personal_budget.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.proj1.personal_budget.models.Expense;
import org.proj1.personal_budget.models.User;
import org.proj1.personal_budget.repositories.ExpenseRepository;
import org.proj1.personal_budget.services.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.proj1.personal_budget.repositories.UserRepository;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ExpenseRepository expenseRepository;
    private final AIService deepSeekService;

    public UserController(AIService deepSeekService) {
        this.deepSeekService = deepSeekService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/profile_name")
    public ResponseEntity<?> getCurrentUserInfo() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof User user) {
            return ResponseEntity.ok( user.getFirstName() + " " + user.getLastName());
        }

        return ResponseEntity.status(401).body("Utilizatorul nu este autentificat.");
    }

    @GetMapping("/spender_type")
    public ResponseEntity<?> getSpenderType() throws Exception {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String month = String.valueOf(LocalDate.now().getMonth());
        System.out.println(month);
        List<Expense> expenseList = expenseRepository.findAllByUserId(user.getId());

        try {
            File fisierPlati = new File("fisierPlata.txt");
            FileWriter writer = new FileWriter("fisierPlata.txt");

            expenseList.forEach(e->{
                try {
                    String monthFromDate = String.valueOf(e.getExpenseDate().getMonth());
                    if(monthFromDate.equals(month)){
                        writer.write(e.getExpenseType() + " " + e.getExpenseDescription() + " " + e.getSum() +"\n");
                    }
                } catch (IOException ex) {
                    throw new RuntimeException(ex);
                }
            });

            writer.close();


        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        String aiRawResponse = deepSeekService.analyzeExpensesFromFile("fisierPlata.txt");

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(aiRawResponse);
        String jsonContent = root.path("choices").get(0).path("message").path("content").asText();

        Map<String, String> result = mapper.readValue(jsonContent, new TypeReference<>() {});

        return ResponseEntity.ok(result);
    }

}
