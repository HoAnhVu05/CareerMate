package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .accountExpired(false)
                .accountLocked(user.getStatus() == User.UserStatus.SUSPENDED || user.getStatus() == User.UserStatus.DELETED)
                .credentialsExpired(false)
                .disabled(user.getStatus() != User.UserStatus.ACTIVE)
                .build();
    }
}
