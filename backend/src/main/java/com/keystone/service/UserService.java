package com.keystone.service;

import com.keystone.dto.UserDTO;
import com.keystone.model.Role;
import com.keystone.model.User;
import com.keystone.model.Technician;
import com.keystone.repository.TechnicianRepository;
import com.keystone.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TechnicianRepository technicianRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.keystone.repository.WorkOrderRepository workOrderRepository;

    public UserService(UserRepository userRepository, 
                       TechnicianRepository technicianRepository, 
                       PasswordEncoder passwordEncoder,
                       com.keystone.repository.WorkOrderRepository workOrderRepository) {
        this.userRepository = userRepository;
        this.technicianRepository = technicianRepository;
        this.passwordEncoder = passwordEncoder;
        this.workOrderRepository = workOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<UserDTO.UserResponseDTO> getAllUsers() {
        return getAllUsers(null);
    }

    @Transactional(readOnly = true)
    public List<UserDTO.UserResponseDTO> getAllUsers(Long adminId) {
        List<User> list = (adminId != null) ? userRepository.findByAdminId(adminId) : userRepository.findAll();
        return list.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO.UserResponseDTO> getAllCustomers() {
        return getAllCustomers(null);
    }

    @Transactional(readOnly = true)
    public List<UserDTO.UserResponseDTO> getAllCustomers(Long adminId) {
        if (adminId == null) {
            return userRepository.findByRole(Role.ROLE_CUSTOMER).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        java.util.Set<User> customerSet = new java.util.LinkedHashSet<>(
                userRepository.findByRoleAndAdminId(Role.ROLE_CUSTOMER, adminId)
        );
        List<com.keystone.model.WorkOrder> orders = workOrderRepository.findByAdminId(adminId);
        for (com.keystone.model.WorkOrder wo : orders) {
            if (wo.getCustomer() != null && wo.getCustomer().getRole() == Role.ROLE_CUSTOMER) {
                customerSet.add(wo.getCustomer());
            }
        }
        return customerSet.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO.UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return mapToDTO(user);
    }

    @Transactional
    public UserDTO.UserResponseDTO createUser(UserDTO.CreateUserRequest request) {
        return createUser(request, null);
    }

    @Transactional
    public UserDTO.UserResponseDTO createUser(UserDTO.CreateUserRequest request, Long adminId) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER;

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(role)
                .phone(request.getPhone())
                .adminId(adminId)
                .active(true)
                .build();

        User saved = userRepository.save(user);

        if (saved.getRole() == Role.ROLE_ADMIN && saved.getAdminId() == null) {
            saved.setAdminId(saved.getId());
            saved = userRepository.save(saved);
        } else if (saved.getRole() == Role.ROLE_TECHNICIAN) {
            Technician tech = Technician.builder()
                    .user(saved)
                    .specialization("General Maintenance")
                    .status("AVAILABLE")
                    .adminId(adminId != null ? adminId : saved.getAdminId())
                    .build();
            technicianRepository.save(tech);
        }

        return mapToDTO(saved);
    }

    @Transactional
    public UserDTO.UserResponseDTO updateUser(Long id, UserDTO.UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return mapToDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    private UserDTO.UserResponseDTO mapToDTO(User u) {
        return new UserDTO.UserResponseDTO(
                u.getId(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getFullName(),
                u.getRole(),
                u.getPhone(),
                u.isActive(),
                u.getCreatedAt()
        );
    }
}
