package com.example.blogservice.exception;

public class AlreadyLikedException extends RuntimeException {
    public AlreadyLikedException() {
        super("Blog post already liked by this user");
    }
}
