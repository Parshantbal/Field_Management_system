package com.keystone.dto;

import com.keystone.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDTO {

    public static class LoginRequest {
        @NotBlank
        @Email
        private String email;

        @NotBlank
        private String password;

        public LoginRequest() {}
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class QuickSwitchRequest {
        @NotBlank
        private String email;

        public QuickSwitchRequest() {}
        public QuickSwitchRequest(String email) { this.email = email; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class RegisterRequest {
        @NotBlank
        @Email
        private String email;

        @NotBlank
        private String password;

        @NotBlank
        private String firstName;

        @NotBlank
        private String lastName;

        private Role role;
        private String phone;

        public RegisterRequest() {}
        public RegisterRequest(String email, String password, String firstName, String lastName, Role role, String phone) {
            this.email = email;
            this.password = password;
            this.firstName = firstName;
            this.lastName = lastName;
            this.role = role;
            this.phone = phone;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private Long userId;
        private String email;
        private String name;
        private Role role;
        private Long technicianId;

        public AuthResponse() {}
        public AuthResponse(String token, String tokenType, Long userId, String email, String name, Role role, Long technicianId) {
            this.token = token;
            this.tokenType = (tokenType != null) ? tokenType : "Bearer";
            this.userId = userId;
            this.email = email;
            this.name = name;
            this.role = role;
            this.technicianId = technicianId;
        }

        public static AuthResponseBuilder builder() { return new AuthResponseBuilder(); }
        public static class AuthResponseBuilder {
            private String token;
            private String tokenType = "Bearer";
            private Long userId;
            private String email;
            private String name;
            private Role role;
            private Long technicianId;

            public AuthResponseBuilder token(String token) { this.token = token; return this; }
            public AuthResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
            public AuthResponseBuilder userId(Long userId) { this.userId = userId; return this; }
            public AuthResponseBuilder email(String email) { this.email = email; return this; }
            public AuthResponseBuilder name(String name) { this.name = name; return this; }
            public AuthResponseBuilder role(Role role) { this.role = role; return this; }
            public AuthResponseBuilder technicianId(Long technicianId) { this.technicianId = technicianId; return this; }
            public AuthResponse build() {
                return new AuthResponse(token, tokenType, userId, email, name, role, technicianId);
            }
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public Long getTechnicianId() { return technicianId; }
        public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }
    }

    public static class UserSummaryDTO {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private Role role;
        private String phone;

        public UserSummaryDTO() {}
        public UserSummaryDTO(Long id, String email, String firstName, String lastName, String fullName, Role role, String phone) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.fullName = fullName;
            this.role = role;
            this.phone = phone;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public static class UserProfileDTO {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private Role role;
        private String phone;

        public UserProfileDTO() {}
        public UserProfileDTO(Long id, String email, String firstName, String lastName, String fullName, Role role, String phone) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.fullName = fullName;
            this.role = role;
            this.phone = phone;
        }

        public static UserProfileDTOBuilder builder() { return new UserProfileDTOBuilder(); }
        public static class UserProfileDTOBuilder {
            private Long id;
            private String email;
            private String firstName;
            private String lastName;
            private String fullName;
            private Role role;
            private String phone;

            public UserProfileDTOBuilder id(Long id) { this.id = id; return this; }
            public UserProfileDTOBuilder email(String email) { this.email = email; return this; }
            public UserProfileDTOBuilder firstName(String firstName) { this.firstName = firstName; return this; }
            public UserProfileDTOBuilder lastName(String lastName) { this.lastName = lastName; return this; }
            public UserProfileDTOBuilder fullName(String fullName) { this.fullName = fullName; return this; }
            public UserProfileDTOBuilder role(Role role) { this.role = role; return this; }
            public UserProfileDTOBuilder phone(String phone) { this.phone = phone; return this; }
            public UserProfileDTO build() {
                return new UserProfileDTO(id, email, firstName, lastName, fullName, role, phone);
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
}
