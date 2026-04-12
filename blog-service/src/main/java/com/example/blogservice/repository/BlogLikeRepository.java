package com.example.blogservice.repository;

import com.example.blogservice.model.BlogLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogLikeRepository extends JpaRepository<BlogLike, UUID> {
    boolean existsByBlogPostIdAndUserId(UUID blogPostId, String userId);
    Optional<BlogLike> findByBlogPostIdAndUserId(UUID blogPostId, String userId);
}
