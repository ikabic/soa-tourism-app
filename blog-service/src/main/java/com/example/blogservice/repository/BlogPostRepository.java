package com.example.blogservice.repository;

import com.example.blogservice.model.BlogPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogPostRepository extends MongoRepository<BlogPost, String> {
}
