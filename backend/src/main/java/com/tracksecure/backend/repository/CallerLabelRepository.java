package com.tracksecure.backend.repository;

import com.tracksecure.backend.domain.CallerLabel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CallerLabelRepository extends JpaRepository<CallerLabel, UUID> {

    Optional<CallerLabel> findByUserIdAndPhoneNumber(UUID userId, String phoneNumber);

    List<CallerLabel> findByUserIdAndPhoneNumberIn(UUID userId, Collection<String> phoneNumbers);
}
