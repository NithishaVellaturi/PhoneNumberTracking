package com.tracksecure.backend.repository;

import com.tracksecure.backend.domain.LookupStatus;
import com.tracksecure.backend.domain.PhoneSearch;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface PhoneSearchRepository extends JpaRepository<PhoneSearch, UUID> {

    long countByPhoneNumber(String phoneNumber);

    long countByStatus(LookupStatus status);

    long countBySearchedAtAfter(Instant instant);

    List<PhoneSearch> findTop6ByPhoneNumberOrderBySearchedAtDesc(String phoneNumber);

    List<PhoneSearch> findTop8ByOrderBySearchedAtDesc();

    @Query("select coalesce(avg(p.spamScore), 0) from PhoneSearch p")
    double averageSpamScore();

    @Query("""
            select p.country as label, count(p) as value
            from PhoneSearch p
            group by p.country
            order by count(p) desc
            """)
    List<MetricProjection> findTopCountries(Pageable pageable);

    @Query("""
            select p.carrier as label, count(p) as value
            from PhoneSearch p
            where p.carrier <> 'Carrier unavailable'
            group by p.carrier
            order by count(p) desc
            """)
    List<MetricProjection> findTopCarriers(Pageable pageable);

    @Query("""
            select p.riskLevel as label, count(p) as value
            from PhoneSearch p
            group by p.riskLevel
            order by count(p) desc
            """)
    List<MetricProjection> findRiskDistribution(Pageable pageable);

    @Query("""
            select p.lineType as label, count(p) as value
            from PhoneSearch p
            group by p.lineType
            order by count(p) desc
            """)
    List<MetricProjection> findLineTypeDistribution(Pageable pageable);
}
