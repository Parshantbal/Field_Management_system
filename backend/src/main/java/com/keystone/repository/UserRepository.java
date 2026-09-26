package com.keystone.repository;

import com.keystone.model.Role;
import com.keystone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByAdminId(Long adminId);
    List<User> findByAdminIdOrAdminIdIsNull(Long adminId);
    List<User> findByRoleAndAdminId(Role role, Long adminId);
}
