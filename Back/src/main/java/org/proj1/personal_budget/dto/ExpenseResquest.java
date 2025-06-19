package org.proj1.personal_budget.dto;

import org.proj1.personal_budget.models.ExpenseType;

import java.time.LocalDateTime;

public class ExpenseResquest {

        private ExpenseType expenseType;
        private double amount;
        private String description;
        private LocalDateTime date;

    public ExpenseType getExpenseType() {
        return expenseType;
    }

    public double getAmount() {
        return amount;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getDate() {
        return date;
    }
}
