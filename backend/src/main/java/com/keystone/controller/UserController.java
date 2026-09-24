package com.keystone.controller;

import com.keystone.dto.UserDTO;
import com.keystone.model.Role;
import com.keystone.service.UserService;
import jakarta.validation.Valid;
import com.keystone.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private Long resolveAdminId(UserPrincipal principal) {
        if (principal == null) return null;
        return principal.getAdminId() != null ? principal.getAdminId() : principal.getId();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<List<UserDTO.UserResponseDTO>> getAllUsers(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getAllUsers(resolveAdminId(principal)));
    }

    @GetMapping("/customers")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<List<UserDTO.UserResponseDTO>> getAllCustomers(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getAllCustomers(resolveAdminId(principal)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<UserDTO.UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO.UserResponseDTO> createUser(
            @Valid @RequestBody UserDTO.CreateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(userService.createUser(request, resolveAdminId(principal)));
    }

    @PostMapping("/customers")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<UserDTO.UserResponseDTO> createCustomer(
            @Valid @RequestBody UserDTO.CreateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        request.setRole(Role.ROLE_CUSTOMER);
        return ResponseEntity.ok(userService.createUser(request, resolveAdminId(principal)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO.UserResponseDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO.UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PutMapping("/customers/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<UserDTO.UserResponseDTO> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO.UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/customers/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
