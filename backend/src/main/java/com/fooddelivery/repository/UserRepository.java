package com.fooddelivery.repository;

import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * UserRepository - Spring Data JPA handles all CRUD automatically
 * We only define custom query methods here
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Find user by email (used for login & JWT validation)
    Optional<User> findByEmail(String email);

    // Check if email already registered
    boolean existsByEmail(String email);

    // Same mobile can exist once per role (USER and SELLER are independent)
    boolean existsByRoleAndMobileNumber(String role, String mobileNumber);
}
