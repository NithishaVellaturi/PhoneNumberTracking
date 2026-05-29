package com.tracksecure.backend.repository;

import com.tracksecure.backend.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("""
            select count(u) from UserAccount u
            where u.lastLoginAt >= :since
               or (u.lastLoginAt is null and u.createdAt >= :since)
            """)
    long countActiveSince(Instant since);
}
