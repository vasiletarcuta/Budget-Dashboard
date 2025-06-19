package org.proj1.personal_budget.controller;

import lombok.Getter;
import org.hibernate.grammars.hql.HqlParser;
import org.proj1.personal_budget.dto.ExpenseResquest;
import org.proj1.personal_budget.models.Expense;
import org.proj1.personal_budget.models.ExpenseType;
import org.proj1.personal_budget.models.User;
import org.proj1.personal_budget.repositories.ExpenseRepository;
import org.proj1.personal_budget.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@PreAuthorize("hasAuthority('ROLE_USER')")
@RequestMapping("/api/expenses/")
public class ExpenseController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addExpense(@RequestBody ExpenseResquest req) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Expense expense = new Expense();
        expense.setUserId(user.getId());
        expense.setExpenseType(req.getExpenseType());
        expense.setExpenseDescription(req.getDescription());
        expense.setExpenseDate(req.getDate());
        expense.setSum((float) req.getAmount());

        expenseRepository.save(expense);

        return ResponseEntity.ok("Expense successfully added!");
    }

    @GetMapping("/all")
    public ResponseEntity<?> seeAllExpenses() {
        List<Expense> expenses = expenseRepository.findAll();
        expenses.forEach(e ->
                System.out.println(e.getExpenseType() + "  " + e.getExpenseDescription())
        );
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/all_by_id")
    public ResponseEntity<?> getExpensesById() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID userId = user.getId();
        List<Expense> expensesList = expenseRepository.findAllByUserId(userId);

        return ResponseEntity.ok(expensesList);
    }

    @GetMapping("/by_type/{type}")
    public ResponseEntity<?> getByType(@PathVariable ExpenseType type) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Expense> filtered = expenseRepository.findByUserIdAndExpenseType(user.getId(), type);
        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/total_by_month")
    public ResponseEntity<?> getTotalByMonth() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Expense> expenses = expenseRepository.findAllByUserId(user.getId());

        Map<String, Float> totals = new HashMap<>();
        for (Expense e : expenses) {
            String month = e.getExpenseDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            totals.put(month, totals.getOrDefault(month, 0f) + e.getSum());
        }

        return ResponseEntity.ok(totals);
    }

    @GetMapping("/total_sum")
    public ResponseEntity<?> getTotalExpenses() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Float total = expenseRepository.sumByUserId(user.getId());
        return ResponseEntity.ok(total);
    }

    @GetMapping("/favorite_categories")
    public ResponseEntity<?> getExpensesTypeMap() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Object[]> rows = expenseRepository.countExpensesByType(user.getId());

        Map<ExpenseType, Long> result = new HashMap<>();
        for (Object[] row : rows) {
            result.put((ExpenseType) row[0], (Long) row[1]);
        }

        Map<ExpenseType, Long> sorted = result.entrySet().stream().sorted(Map.Entry.<ExpenseType, Long>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new));
        return ResponseEntity.ok(sorted);
    }

    @GetMapping("/budget/suggestions")
    public ResponseEntity<Map<String, Double>> getSuggestedBudgets() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID userId = user.getId();

        LocalDate now = LocalDate.now();
        LocalDate threeMonthsAgo = now.minusMonths(3).withDayOfMonth(1);

        List<Expense> expenses = expenseRepository.findByUserIdAndExpenseDateAfter(userId, threeMonthsAgo.atStartOfDay());

        Map<ExpenseType, List<Float>> grouped = expenses.stream()
                .collect(Collectors.groupingBy(Expense::getExpenseType,
                        Collectors.mapping(Expense::getSum, Collectors.toList())));

        Map<String, Double> suggested = new HashMap<>();
        for (Map.Entry<ExpenseType, List<Float>> entry : grouped.entrySet()) {
            double avg = entry.getValue().stream()
                    .mapToDouble(Float::doubleValue)
                    .average()
                    .orElse(0.0);
            suggested.put(entry.getKey().toString(), Math.round(avg * 100.0) / 100.0);
        }

        return ResponseEntity.ok(suggested);
    }
}
