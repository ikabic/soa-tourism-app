package com.example.blogservice.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "blog_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"blog_post_id", "user_id"})
})
public class BlogLike {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "blog_post_id", nullable = false)
    private UUID blogPostId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBlogPostId() { return blogPostId; }
    public void setBlogPostId(UUID blogPostId) { this.blogPostId = blogPostId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
