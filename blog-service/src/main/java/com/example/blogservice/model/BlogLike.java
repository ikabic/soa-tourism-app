package com.example.blogservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "blog_likes")
@CompoundIndex(def = "{'blog_post_id': 1, 'user_id': 1}", unique = true)
public class BlogLike {

    @Id
    private String id;

    @Field("blog_post_id")
    private String blogPostId;

    @Field("user_id")
    private String userId;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBlogPostId() { return blogPostId; }
    public void setBlogPostId(String blogPostId) { this.blogPostId = blogPostId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
