package org.proj1.personal_budget.repositories;

import org.proj1.personal_budget.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    public User findUserByEmail(String email);

    boolean existsByEmail(String email);

}
