package com.keystone.service;

import com.keystone.dto.AuthDTO;
import com.keystone.model.Role;
import com.keystone.model.Technician;
import com.keystone.model.User;
import com.keystone.repository.TechnicianRepository;
import com.keystone.repository.UserRepository;
import com.keystone.security.JwtTokenProvider;
import com.keystone.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TechnicianRepository technicianRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            TechnicianRepository technicianRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.technicianRepository = technicianRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Long techId = null;
        if (principal.getRole() == Role.ROLE_TECHNICIAN) {
            techId = technicianRepository.findByUserId(principal.getId())
                    .map(Technician::getId)
                    .orElse(null);
        }

        return AuthDTO.AuthResponse.builder()
                .token(jwt)
                .userId(principal.getId())
                .email(principal.getEmail())
                .name(principal.getFullName())
                .role(principal.getRole())
                .technicianId(techId)
                .build();
    }

    public AuthDTO.AuthResponse quickSwitch(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        String jwt = tokenProvider.generateToken(auth);
        Long techId = null;
        if (user.getRole() == Role.ROLE_TECHNICIAN) {
            techId = technicianRepository.findByUserId(user.getId())
                    .map(Technician::getId)
                    .orElse(null);
        }

        return AuthDTO.AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getFullName())
                .role(user.getRole())
                .technicianId(techId)
                .build();
    }

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER;

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(assignedRole)
                .phone(request.getPhone())
                .active(true)
                .build();

        User saved = userRepository.save(user);

        if (saved.getRole() == Role.ROLE_ADMIN) {
            saved.setAdminId(saved.getId());
            saved = userRepository.save(saved);
        } else if (saved.getRole() == Role.ROLE_TECHNICIAN) {
            Technician tech = Technician.builder()
                    .user(saved)
                    .specialization("General Maintenance")
                    .status("AVAILABLE")
                    .adminId(saved.getAdminId())
                    .build();
            technicianRepository.save(tech);
        }

        UserPrincipal principal = UserPrincipal.create(saved);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
        String jwt = tokenProvider.generateToken(auth);

        Long techId = null;
        if (saved.getRole() == Role.ROLE_TECHNICIAN) {
            techId = technicianRepository.findByUserId(saved.getId())
                    .map(Technician::getId)
                    .orElse(null);
        }

        return AuthDTO.AuthResponse.builder()
                .token(jwt)
                .userId(saved.getId())
                .email(saved.getEmail())
                .name(saved.getFullName())
                .role(saved.getRole())
                .technicianId(techId)
                .build();
    }

    public AuthDTO.UserProfileDTO getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        return AuthDTO.UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .build();
    }
}
