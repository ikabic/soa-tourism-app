package com.example.blogservice.exception;

public class BlogNotFoundException extends RuntimeException {
    public BlogNotFoundException(String blogPostId) {
        super("Blog post not found: " + blogPostId);
    }
}
