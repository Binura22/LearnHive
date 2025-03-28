package com.example.coursemanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            // Explicitly configure form login instead of using withDefaults()
            .formLogin(form -> form
                .loginPage("/login") // Default login page provided by Spring Security
                .defaultSuccessUrl("/api/admin/courses", true) // Redirect after login
                .permitAll()
            )
            .logout(logout -> logout.permitAll())
            .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity
            .build();
    }

    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        String encodedPassword = new BCryptPasswordEncoder().encode("admin123");
        UserDetails admin = User.withUsername("admin")
            .password(encodedPassword)
            .roles("ADMIN")
            .build();

        return new InMemoryUserDetailsManager(admin);
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}