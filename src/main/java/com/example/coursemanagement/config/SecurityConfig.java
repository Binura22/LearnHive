package com.example.coursemanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests((auth) -> auth
                // Admin-only endpoints
                .requestMatchers("/admin/**").hasRole("ADMIN")
                // Public endpoints
                .requestMatchers("/courses/view-all", "/courses/view/**").permitAll()
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login") // Custom login page
                .defaultSuccessUrl("/courses/view-all", true) // Redirect after login
                .permitAll()
            )
            .logout(logout -> logout
                .permitAll()
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        // Create an admin user
        UserDetails admin = User.withUsername("admin")
                                 .password(passwordEncoder().encode("adminpassword"))
                                 .roles("ADMIN")
                                 .build();

        // Create a normal user
        UserDetails user = User.withUsername("user")
                               .password(passwordEncoder().encode("userpassword"))
                               .roles("USER")
                               .build();

        // Return both users
        return new InMemoryUserDetailsManager(admin, user);
    }
}