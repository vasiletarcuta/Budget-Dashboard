package org.proj1.personal_budget.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class Expense {
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    private UUID userId;

    @Enumerated
    private ExpenseType expenseType;

    private String expenseDescription;
    private LocalDateTime expenseDate;
    private float sum;


}
