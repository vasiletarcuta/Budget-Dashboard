package org.proj1.personal_budget.repositories;

import org.proj1.personal_budget.models.Expense;
import org.proj1.personal_budget.models.ExpenseType;
import org.proj1.personal_budget.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, User> {

    public Expense findExpensesByUserId(UUID userId);
    List<Expense> findAllByUserId(UUID userId);

    List<Expense> findByUserIdAndExpenseType(UUID id, ExpenseType type);

    @Query("SELECT SUM(e.sum) FROM Expense e WHERE e.userId = :userId")
    Float sumByUserId(@Param("userId") UUID userId);

    @Query("SELECT e.expenseType, COUNT(e) from Expense e where e.userId=:userId group by e.expenseType ORDER BY COUNT(e) DESC")
    List<Object[]> countExpensesByType(@Param("userId") UUID userId);

    List<Expense> findByUserIdAndExpenseDateAfter(UUID userId, LocalDateTime localDateTime);
}
