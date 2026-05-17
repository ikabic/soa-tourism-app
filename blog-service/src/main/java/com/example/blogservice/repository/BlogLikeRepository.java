package com.example.blogservice.repository;

import com.example.blogservice.model.BlogLike;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogLikeRepository extends MongoRepository<BlogLike, String> {
    boolean existsByBlogPostIdAndUserId(String blogPostId, String userId);
    Optional<BlogLike> findByBlogPostIdAndUserId(String blogPostId, String userId);
}
